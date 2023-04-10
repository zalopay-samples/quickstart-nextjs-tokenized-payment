import axios from "axios";
import CryptoJS from "crypto-js";
import {configZLP, ZLP_API_PATH} from "../../config";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const unbind = {
        app_id: configZLP.app_id,
        binding_id: req.body.bindingID,
        req_date: Date.now(), // milliseconds
        identifier: "ZLP User",
      };

      // app_id|identifier|binding_id|req_date
      const data = configZLP.app_id + "|" + unbind.identifier + "|" + unbind.binding_id + "|" + unbind.req_date;
      unbind.mac = CryptoJS.HmacSHA256(data, configZLP.key1).toString();

      axios.post(configZLP.zlp_endpoint + ZLP_API_PATH.AGREEMENT_UNBINDING, null, {params: unbind})
      .then(result => {
        res.status(200).json(result.data);
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