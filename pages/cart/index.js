import {useEffect, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import {useShoppingCart} from '@/hooks/use-shopping-cart';
import {formatCurrency, generateAppTransID} from '@/lib/utils';
import {MinusSmIcon, PlusSmIcon, XCircleIcon, XIcon,} from '@heroicons/react/outline';
import {useRouter} from "next/router";
import {Button, Drawer, message, Spin, Typography} from "antd";
import axios from "axios";
import moment from "moment/moment";
import {API_ROUTES} from "../api/config";

const {Text} = Typography;

const Cart = () => {
  const {
    cartDetails, totalPrice, cartCount, addItem, removeItem, clearCart, payToken, bindingID, bindAppTransID,
    setPayToken,
    setBindingID,
    setBindAppTransID,
    clearAgreement
  } =
      useShoppingCart();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userMaskedPhone, setUserMaskedPhone] = useState('');
  const router = useRouter();

  // ZLP will redirect to merchant website or merchant app with params: binding_id, status
  const {binding_id, status} = router.query;


  useEffect(async () => {
    if (binding_id && status === '1' && payToken === '') {
      if (!bindAppTransID) {
        console.warn("bindAppTransID is not found")
      } else {
        const agreement = await axios.post(API_ROUTES.AGREEMENT_QUERY, {
          appTransID: bindAppTransID
        });
        const agreementData = agreement.data;
        if (agreementData.return_code === 1) {
          setPayToken(agreementData.data.pay_token);
          setBindingID(agreementData.data.binding_id);
          message.success("Binding success with your ZaloPay!")
        }
      }
    }
    // Query basic user infos
    if (userMaskedPhone === '' && payToken !== '') {
      const userInfo = await axios.post(API_ROUTES.AGREEMENT_QUERY_USER, {
        payToken: payToken
      });
      if (userInfo.data.return_code === 1) {
        setUserMaskedPhone(userInfo.data.phone);
      }
    }
  });

  const onOpen = async () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onBind = async (e) => {
    // create agreement binding
    setLoading(true);
    const transID = Math.floor(Math.random() * 1000000);
    const appTransID = `${moment().format('YYMMDD')}_${transID}`;
    setBindAppTransID(appTransID);
    const res = await axios.post(API_ROUTES.AGREEMENT_BINDING, {
      appTransID: appTransID
    });
    if (res.data.error) {
      message.error(`Created agreement binding failed, cause = ${res.data.message}`);
    } else {
      e.preventDefault();
      await router.push(res.data.binding_qr_link);
    }
  };

  const onPay = async () => {
    setLoading(true);
    // 1. Check balance
    const step1 = await axios.post(API_ROUTES.AGREEMENT_BALANCE, {
      payToken: payToken,
      amount: totalPrice
    });
    if (!isPayable(step1.data)) {
      message.error("Your balance in ZaloPay is not enough!");
      setLoading(false);
      return;
    }

    // 2. Create payment order
    const orderAppTransID = generateAppTransID();
    const step2 = await axios.post(API_ROUTES.CREATE_ORDER, {
      appTransID: orderAppTransID,
      amount: totalPrice
    });
    if (step2.data.return_code !== 1) {
      message.error("Create order in ZaloPay failed!");
      setLoading(false);
      return;
    }
    const zpTransToken = step2.data.zp_trans_token;

    // 3. Pay by token
    const step3 = await axios.post(API_ROUTES.AGREEMENT_PAY, {
      zpTransToken: zpTransToken,
      payToken: payToken
    });
    const payStatus = step3.data.return_code;
    // Only stop if failed
    if (payStatus === 2) {
      message.error("Pay by token in ZaloPay failed!");
      setLoading(false);
    } else if (payStatus === 1) { // SUCCESS
      setLoading(false);
      await router.push('/status/success');
    } else { // PROCESSING -> Query order status or wait for callback
      // 4. Query payment status (interval) & notify and delivery order
      let checkPaymentStatus = setInterval(async () => {
        // interval query order ZLP status
        const res = await axios.post(API_ROUTES.QUERY_ORDER, {
          appTransID: orderAppTransID
        });
        const returnCode = res.data.return_code;
        if (returnCode === 1) {
          clearInterval(checkPaymentStatus);
          setLoading(false);
          await router.push('/status/success');
        }
      }, 1000)
      return () => {
        clearInterval(checkPaymentStatus);
      };
    }
  }

  const isPayable = (res) => {
    const returnCode = res.return_code;
    let payable;
    if (res.data !== null) {
      payable = res.data[0].payable;
    }
    return returnCode === 1 && payable;
  }

  const onUnbind = async (e) => {
    setLoading(true);
    const res = await axios.post(API_ROUTES.AGREEMENT_UNBINDING, {
      bindingID: bindingID
    });
    if (res.data.return_code !== 1) {
      message.error("Unbind failed, cause=" + res.data.sub_return_message);
    } else {
      clearAgreement();
      setLoading(false);
      message.success("Unbind success with your ZaloPay!")
      e.preventDefault();
      await router.push('/cart');
    }
  }

  return (
      <>
        <Head>
          <title>My Shopping Cart </title>
        </Head>
        <div className="container xl:max-w-screen-xl mx-auto py-12 px-6">
          {cartCount > 0 ? (
              <>
                <h2 className="text-4xl font-semibold">Your shopping cart</h2>
                <p className="mt-1 text-xl">
                  {cartCount} items{' '}
                  <button
                      onClick={clearCart}
                      className="opacity-50 hover:opacity-100 text-base capitalize"
                  >
                    (Clear all)
                  </button>
                </p>
              </>
          ) : (
              <>
                <h2 className="text-4xl font-semibold">
                  Your shopping cart is empty.
                </h2>
                <p className="mt-1 text-xl">
                  Check out our awesome plants{' '}
                  <Link href="/">
                    <a className="text-red-500 underline">here!</a>
                  </Link>
                </p>
              </>
          )}

          {cartCount > 0 ? (
              <div className="mt-12">
                {Object.entries(cartDetails).map(([key, product]) => (
                    <div
                        key={key}
                        className="flex justify-between space-x-4 hover:shadow-lg hover:border-opacity-50 border border-opacity-0 rounded-md p-4"
                    >
                      {/* Image + Name */}
                      <Link href={`/products/${product.id}`}>
                        <a className="flex items-center space-x-4 group">
                          <div className="relative w-20 h-20 group-hover:scale-110 transition-transform">
                            <Image
                                src={product.image}
                                alt={product.name}
                                layout="fill"
                                objectFit="contain"
                            />
                          </div>
                          <p className="font-semibold text-xl group-hover:underline">
                            {product.name}
                          </p>
                        </a>
                      </Link>

                      {/* Price + Actions */}
                      <div className="flex items-center">
                        {/* Quantity */}
                        <div className="flex items-center space-x-3">
                          <button
                              onClick={() => removeItem(product)}
                              disabled={product?.quantity <= 1}
                              className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current hover:bg-rose-100 hover:text-rose-500 rounded-md p-1"
                          >
                            <MinusSmIcon className="w-6 h-6 flex-shrink-0"/>
                          </button>
                          <p className="font-semibold text-xl">{product.quantity}</p>
                          <button
                              onClick={() => addItem(product)}
                              className="hover:bg-green-100 hover:text-green-500 rounded-md p-1"
                          >
                            <PlusSmIcon className="w-6 h-6 flex-shrink-0 "/>
                          </button>
                        </div>

                        {/* Price */}
                        <p className="font-semibold text-xl ml-16">
                          <XIcon className="w-4 h-4 text-gray-500 inline-block"/>
                          {formatCurrency(product.price)}
                        </p>

                        {/* Remove item */}
                        <button
                            onClick={() => removeItem(product, product.quantity)}
                            className="ml-4 hover:text-rose-500"
                        >
                          <XCircleIcon
                              className="w-6 h-6 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"/>
                        </button>
                      </div>
                    </div>
                ))}

                <div className="flex flex-col items-end border-t py-4 mt-8">
                  <p className="text-xl">
                    Total:{' '}
                    <span className="font-semibold">
                      {formatCurrency(totalPrice)}
                    </span>
                  </p>
                  <Button onClick={onOpen} type="primary" size="large" className="agreement-btn" danger>
                    Payment with ZaloPay
                  </Button>

                  <Drawer title="ZaloPay Wallet" width='500' placement="right" onClose={onClose} open={open}>
                    <div className="payment-page">
                      {payToken === '' ? (
                          <Spin spinning={loading} tip="Processing...">
                            <Typography>
                              <div className="tokenization-description">
                                <img src="/images/ZaloPay-vuong.png"
                                     id="zlp-logo-tokenization"
                                     alt=""/>
                                <div>
                                  Link your ZaloPay E-Wallet to Planty for faster payment!
                                </div>
                              </div>
                              <br/>
                              <div id="payment-steps">
                                <Text strong>Ensure you have these ready: </Text>
                                <br/>
                                <br/>
                                <ol>
                                  <li>
                                    <p>Password for ZaloPay login.</p>
                                  </li>
                                  <li>
                                    <p>Your mobile number registered for ZaloPay is active.</p>
                                  </li>
                                </ol>
                              </div>
                              <br/>
                              <div>
                                <Button onClick={onBind} type="primary" size="large" className="agreement-btn" block>
                                  Confirm Selection
                                </Button>
                              </div>
                            </Typography>
                          </Spin>

                      ) : (
                          <Spin spinning={loading} tip="Processing...">
                            <Typography>
                              <div className="tokenization-description">
                                <img src="/images/ZaloPay-vuong.png"
                                     id="zlp-logo-tokenization"
                                     alt=""/>
                                <div>
                                  <Text strong>Your ZaloPay: </Text>
                                  <p>Phone: {userMaskedPhone}</p>
                                </div>
                              </div>

                              <br/>
                              <div id="payment-steps">
                                <Text strong>Your ZaloPay is binding with Planty, Planty is allowed: </Text>
                                <br/>
                                <br/>
                                <ol>
                                  <li>
                                    <p>Access your identifier on ZaloPay.</p>
                                  </li>
                                  <li>
                                    <p>Fund back, money transfer to your ZaloPay wallet.</p>
                                  </li>
                                </ol>
                              </div>
                              <br/>
                              <Button onClick={onPay} type="primary" size="large" className="agreement-btn" block>
                                Pay
                              </Button>

                              <Button onClick={onUnbind} type="primary" size="large" className="agreement-btn" danger
                                      block>
                                Unbind
                              </Button>
                            </Typography>
                          </Spin>
                      )}
                    </div>
                  </Drawer>
                </div>
              </div>
          ) : null}
        </div>
      </>
  );
};

export default Cart;
