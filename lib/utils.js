import axios from 'axios';
import confetti from 'canvas-confetti';
import moment from "moment/moment";

export const generateAppTransID = () => {
  const transID = Math.floor(Math.random() * 1000000);
  return `${moment().format('YYMMDD')}_${transID}`;
}

export const formatCurrency = (amount = 0, currency = 'VND') =>
  new Intl.NumberFormat('vn-VN', {
    style: 'currency',
    currency,
    minimumIntegerDigits: 2,
  }).format(amount);

export const isClient = typeof window === 'object';

export const fetcher = url => axios.get(url).then(res => res.data);

export const shootFireworks = () => {
  const duration = 4 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.2, 0.4), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.6, 0.8), y: Math.random() - 0.2 },
      })
    );
  }, 250);
};
