import axios from "axios";
import CryptoJS from "crypto-js";
import {configZLP, ZLP_API_PATH} from "../../config";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const postData = {
        app_id: configZLP.app_id,
        identifier: "ZLP User",
        pay_token: req.body.payToken,
        zp_trans_token: req.body.zpTransToken,
        req_date: Date.now(), // milliseconds
      };

      // appid|app_trans_id|appuser|amount|apptime|embeddata|item
      const data = configZLP.app_id + "|" + postData.identifier + "|" + postData.zp_trans_token + "|" + postData.pay_token + "|" + postData.req_date;
      postData.mac = CryptoJS.HmacSHA256(data, configZLP.key1).toString();

      axios.post(configZLP.zlp_endpoint + ZLP_API_PATH.AGREEMENT_PAY, null, {params: postData})
      .then(result => {
        if (result.data.return_code === 1) {
          res.status(200).json(result.data);
        } else {
          res.status(200).json({
            error: true,
            error_code: result.data.sub_return_code,
            message: result.data.sub_return_message
          });
        }
      })
      .catch(err => console.log(err));
    } catch (err) {
      console.log(err)
      res.status(500).json({statusCode: 500, message: err.message});
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}