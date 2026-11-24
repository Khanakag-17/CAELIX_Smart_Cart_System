#include <WiFi.h>
#include <HTTPClient.h>
#include "HX711.h"

// Wi-Fi credentials
const char* ssid = "SmartCart";
const char* password = "smartcart123";

// Flask server URL
const char* serverName = "http://192.168.177.90:5000/weight";

// Calibration scale factors (keep these from last calibration)
#define SCALE1 100.585037
#define SCALE2 118.054420

HX711 scale1;
HX711 scale2;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Connected to Wi-Fi");

  // Begin HX711
  scale1.begin(21, 22);
  scale2.begin(19, 23);

  scale1.set_scale(SCALE1);
  scale2.set_scale(SCALE2);

  // Tare both scales on boot
  Serial.println("Taring...");
  scale1.tare(); // Takes average of 10 readings by default
  scale2.tare();
  Serial.println("✅ Taring complete. Ready to weigh.");

  delay(1000); // Stabilize after tare
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float weight1 = scale1.get_units(10);  // average of 10 readings
    float weight2 = scale2.get_units(10);
    float totalWeight = weight1 + weight2;

    Serial.print("Weight: ");
    Serial.print(totalWeight, 2);
    Serial.println(" g");

    // Send to Flask server
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"weight\": " + String(totalWeight, 2) + "}";
    int responseCode = http.POST(payload);

    if (responseCode > 0) {
      Serial.print("✅ Data sent. Response code: ");
      Serial.println(responseCode);
    } else {
      Serial.print("❌ Failed to send. Error: ");
      Serial.println(http.errorToString(responseCode));
    }

    http.end();
  }

  delay(1000); // Wait for 1 second
}
