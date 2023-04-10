import {configZLP} from "../../config";
import CryptoJS from "crypto-js";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      let result = {};
      try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;
        let dataJson = JSON.parse(dataStr, configZLP.key2);
        let status = dataJson["status"];

        let mac = CryptoJS.HmacSHA256(dataStr, configZLP.key2).toString();
        console.log("mac =", mac);

        // kiểm tra callback hợp lệ (đến từ ZaloPay server)
        if (reqMac !== mac) {
          // callback không hợp lệ
          result.return_code = -1;
          result.return_message = "mac not equal";
        } else {
          if (status === 1) { // Confirmed
            console.log("✅  Confirmed Binding callback received!");
            console.log("🌈  Please provide mechanism to store payToken=", dataJson["pay_token"]);
          } else if (status === 3) { // Cancelled
            console.log(`❌ Cancelled Binding callback received!`);
          } else if (status === 4) { // Disabled
            console.log("🙅‍ Disabled Binding callback received!");
            console.log("🌈  Please provide mechanism to clear agreement info");
          }

          result.return_code = 1;
          result.return_message = "success";
        }
      } catch (ex) {
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
      }

      // thông báo kết quả cho ZaloPay server
      res.json(result);
    } catch (err) {
      res.status(500).json({statusCode: 500, message: err.message});
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}