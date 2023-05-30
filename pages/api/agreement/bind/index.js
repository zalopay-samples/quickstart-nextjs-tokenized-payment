import axios from "axios";
import CryptoJS from "crypto-js";
import {API_ROUTES, configZLP, ZLP_API_PATH} from "../../config";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const binding_data = {};
      const bind = {
        app_id: configZLP.app_id,
        app_trans_id: req.body.appTransID,
        req_date: Date.now(), // milliseconds
        identifier: "ZLP User",
        max_amount: 0,
        binding_type: 'WALLET',
        binding_data: JSON.stringify(binding_data),
        callback_url: configZLP.host + API_ROUTES.AGREEMENT_CALLBACK,
        redirect_url: configZLP.host + "/cart" // testing purpose
      };

      // appid|app_trans_id|appuser|amount|apptime|embeddata|item
      const data = configZLP.app_id + "|" + bind.app_trans_id + "|" + bind.binding_data + "|" + bind.binding_type + "|" + bind.identifier + "|" + bind.max_amount + "|" + bind.req_date;
      bind.mac = CryptoJS.HmacSHA256(data, configZLP.key1).toString();

      axios.post(configZLP.zlp_endpoint + ZLP_API_PATH.AGREEMENT_BINDING, null, {params: bind})
      .then(result => {
        if (result.data.return_code === 1) {
          res.status(200).json({
            binding_token: result.data.binding_token,
            binding_qr_link: result.data.binding_qr_link // web-based scenario
          });
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
      res.status(500).json({statusCode: 500, message: err.message});
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}