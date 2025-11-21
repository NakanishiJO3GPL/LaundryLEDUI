use tauri::Emitter;
use hidapi::HidApi;

pub const LEDHID_VID: u16 = 0x1209;
pub const LEDHID_PID: u16 = 0x0001;

#[tauri::command]
async fn send_led(ir: u8, wh: u8, uv: u8) -> Result<(), String> {
    println!("send_led called with ir: {}, wh: {}, uv: {}", ir, wh, uv);
    let mut data = [0u8; 5];
    data[0] = 1;
    data[1] = wh;
    data[2] = ir;
    data[3] = uv;
    let hid_api = HidApi::new().map_err(|e| e.to_string())?;
    let device = hid_api.open(LEDHID_VID, LEDHID_PID).map_err(|e| e.to_string())?;
    device.write(&data).map_err(|e| e.to_string())?;
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
