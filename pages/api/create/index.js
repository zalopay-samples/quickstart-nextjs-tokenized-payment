import axios from "axios";
import CryptoJS from "crypto-js";
import {API_ROUTES, configZLP, ZLP_API_PATH} from "../config";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const embed_data = {zlppaymentid: "P271021"};
      const items = [{}];
      const order = {
        app_id: configZLP.app_id,
        app_trans_id: req.body.appTransID, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
        app_user: "user123",
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: req.body.amount,
        description: `Planty - Payment for the order #${req.body.appTransID}`,
        bank_code: "zalopayapp",
        callback_url: configZLP.host + API_ROUTES.CREATE_ORDER_CALLBACK
      };

      // appid|app_trans_id|appuser|amount|apptime|embeddata|item
      const data = configZLP.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
      order.mac = CryptoJS.HmacSHA256(data, configZLP.key1).toString();

      axios.post(configZLP.zlp_endpoint + ZLP_API_PATH.CREATE_ORDER, null, {params: order})
      .then(result => {
        res.status(200).json(result.data);
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