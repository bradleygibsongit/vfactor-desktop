use std::process::{Child, Command};
use std::sync::Mutex;
use std::io::{BufRead, BufReader};
use tauri::{Manager, State};

/// Global state for the OpenCode server process
struct OpenCodeServer {
    process: Mutex<Option<Child>>,
}

/// Start the OpenCode server
#[tauri::command]
async fn start_opencode_server(
    state: State<'_, OpenCodeServer>,
) -> Result<String, String> {
    let mut process_guard = state.process.lock().map_err(|e| e.to_string())?;

    // Check if already running
    if let Some(ref mut child) = *process_guard {
        match child.try_wait() {
            Ok(Some(_)) => {
                // Process has exited, we can start a new one
                *process_guard = None;
            }
            Ok(None) => {
                // Still running
                return Ok("OpenCode server already running".to_string());
            }
            Err(e) => {
                log::warn!("Error checking process status: {}", e);
                *process_guard = None;
            }
        }
    }

    // Start the opencode serve process
    log::info!("Starting OpenCode server...");
    
    let mut child = Command::new("opencode")
        .args(["serve", "--port", "4096"])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start OpenCode server: {}. Is 'opencode' installed?", e))?;

    // Wait for the server to be ready by reading stdout
    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            match line {
                Ok(line) => {
                    log::info!("OpenCode: {}", line);
                    if line.contains("listening") {
                        log::info!("OpenCode server is ready");
                        break;
                    }
                }
                Err(e) => {
                    log::warn!("Error reading stdout: {}", e);
                    break;
                }
            }
        }
    }

    *process_guard = Some(child);
    Ok("OpenCode server started".to_string())
}

/// Stop the OpenCode server
#[tauri::command]
async fn stop_opencode_server(state: State<'_, OpenCodeServer>) -> Result<String, String> {
    let mut process_guard = state.process.lock().map_err(|e| e.to_string())?;

    if let Some(mut child) = process_guard.take() {
        log::info!("Stopping OpenCode server...");
        child.kill().map_err(|e| format!("Failed to kill OpenCode server: {}", e))?;
        child.wait().map_err(|e| format!("Failed to wait for OpenCode server: {}", e))?;
        log::info!("OpenCode server stopped");
        Ok("OpenCode server stopped".to_string())
    } else {
        Ok("OpenCode server was not running".to_string())
    }
}

/// Check if OpenCode server is running
#[tauri::command]
async fn is_opencode_server_running(state: State<'_, OpenCodeServer>) -> Result<bool, String> {
    let mut process_guard = state.process.lock().map_err(|e| e.to_string())?;

    if let Some(ref mut child) = *process_guard {
        match child.try_wait() {
            Ok(Some(_)) => {
                // Process has exited
                *process_guard = None;
                Ok(false)
            }
            Ok(None) => Ok(true),
            Err(e) => {
                log::warn!("Error checking process status: {}", e);
                Ok(false)
            }
        }
    } else {
        Ok(false)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .manage(OpenCodeServer {
            process: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            start_opencode_server,
            stop_opencode_server,
            is_opencode_server_running,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            // Stop the server when the app closes
            if let tauri::WindowEvent::Destroyed = event {
                let state: State<OpenCodeServer> = window.state();
                let mut process_guard = match state.process.lock() {
                    Ok(guard) => guard,
                    Err(_) => return,
                };
                if let Some(mut child) = process_guard.take() {
                    log::info!("App closing, stopping OpenCode server...");
                    let _ = child.kill();
                    let _ = child.wait();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
