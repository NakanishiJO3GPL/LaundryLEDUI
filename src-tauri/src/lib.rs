use tauri::Emitter;
use hidapi::HidApi;

pub const LEDHID_VID: u16 = 0x1209;
pub const LEDHID_PID: u16 = 0x0001;

#[cfg(target_os = "macos")]
#[tauri::command]
async fn send_led(ir: u8, wh: u8, uv: u8) -> Result<(), String> {
    
    // macOSではブロッキング処理を別スレッドで実行
    tokio::task::spawn_blocking(move || {
        let hid_api = HidApi::new().map_err(|e| {
            e.to_string()
        })?;
        
        // デバイスを検索してパスを取得
        let device_info = hid_api.device_list()
            .find(|d| d.vendor_id() == LEDHID_VID && d.product_id() == LEDHID_PID)
            .ok_or_else(|| {
                eprintln!("HID device not found (VID: 0x{:04X}, PID: 0x{:04X})", LEDHID_VID, LEDHID_PID);
                "Device not found".to_string()
            })?;
        
        // パスを使用してデバイスを開く（macOSでより確実）
        let device = device_info.open_device(&hid_api).map_err(|e| {
            e.to_string()
        })?;
        
        #[cfg(target_os = "macos")]
        let data = [0u8, wh, ir, uv];
        #[cfg(not(target_os = "macos"))]
        let data = [1u8, wh, ir, uv];
        
        let _ = device.write(&data).map_err(|e| {
            e.to_string()
        })?;
        
        Ok::<(), String>(())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let mut hid_api = HidApi::new().expect("Failed to create HID API instance");
                loop {
                    hid_api.refresh_devices().expect("Failed to refresh HID devices");
                    let devices = hid_api.device_list();
                    let mut find = false;
                    for dev in devices {
                        if dev.vendor_id() == LEDHID_VID && dev.product_id() == LEDHID_PID {
                            find = true;
                            break;
                        }
                    }
                    
                    if find == false {
                        let _ = app_handle.emit("ledhid-no-devices", ());
                    }
                    else {
                        let _ = app_handle.emit("ledhid-devices-found", ());
                    }
                    tokio::time::sleep(std::time::Duration::from_millis(100)).await;
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![send_led])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
