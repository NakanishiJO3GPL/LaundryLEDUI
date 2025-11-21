import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import "./fluent-ui.d.ts";

function App() {
  const [sliderIr, setSliderIr] = useState(0);
  const [sliderWh, setSliderWh] = useState(0);
  const [sliderUv, setSliderUv] = useState(0);
  const [deviceConnected, setDeviceConnected] = useState(false);
  
  const sliderIrRef = useRef<any>(null);
  const sliderWhRef = useRef<any>(null);
  const sliderUvRef = useRef<any>(null);

  var ir = 0;
  var wh = 0;
  var uv = 0;

  const handleSliderChange = async () => {
    await invoke("send_led", { ir, wh, uv });
  };

  useEffect(() => {
    // Listen for device connection events
    const unlistenDevicesFound = listen('ledhid-devices-found', () => {
      setDeviceConnected(true);
    });

    const unlistenNoDevices = listen('ledhid-no-devices', () => {
      setDeviceConnected(false);
    });

    const handleSlider1Change = (e: any) => {
      const value = parseInt(e.target.value);
      setSliderIr(value);
      ir = value;
      handleSliderChange();
    };

    const handleSlider2Change = (e: any) => {
      const value = parseInt(e.target.value);
      setSliderWh(value);
      wh = value;
      handleSliderChange();
    };

    const handleSlider3Change = (e: any) => {
      const value = parseInt(e.target.value);
      setSliderUv(value);
      uv = value;
      handleSliderChange();
    };

    sliderIrRef.current?.addEventListener('change', handleSlider1Change);
    sliderWhRef.current?.addEventListener('change', handleSlider2Change);
    sliderUvRef.current?.addEventListener('change', handleSlider3Change);

    return () => {
      unlistenDevicesFound.then(fn => fn());
      unlistenNoDevices.then(fn => fn());
      sliderIrRef.current?.removeEventListener('change', handleSlider1Change);
      sliderWhRef.current?.removeEventListener('change', handleSlider2Change);
      sliderUvRef.current?.removeEventListener('change', handleSlider3Change);
    };
  }, []);

  return (
    <main className="container">
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "12px" }}>
          <fluent-switch checked={deviceConnected} disabled={true}></fluent-switch>
          <label style={{ fontSize: "16px", fontWeight: "500" }}>
            HIDデバイス: {deviceConnected ? "接続済み" : "未接続"}
          </label>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            赤外線LED: {sliderIr}%
          </label>
          <fluent-slider ref={sliderIrRef} min="0" max="100" value="0" style={{ width: "100%" }}>
            <fluent-slider-label position="0">0</fluent-slider-label>
            <fluent-slider-label position="100">100%</fluent-slider-label>
          </fluent-slider>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            白色LED: {sliderWh}%
          </label>
          <fluent-slider ref={sliderWhRef} min="0" max="100" value="0" style={{ width: "100%" }}>
            <fluent-slider-label position="0">0%</fluent-slider-label>
            <fluent-slider-label position="100">100%</fluent-slider-label>
          </fluent-slider>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            紫外線LED: {sliderUv}%
          </label>
          <fluent-slider ref={sliderUvRef} min="0" max="100" value="0" style={{ width: "100%" }}>
            <fluent-slider-label position="0">0%</fluent-slider-label>
            <fluent-slider-label position="100">100%</fluent-slider-label>
          </fluent-slider>
        </div>
      </div>
    </main>
  );
}

export default App;
