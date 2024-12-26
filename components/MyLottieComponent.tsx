"use client";

import { useLottie } from 'lottie-react'
import jsonAnimation from '../public/Animation.json'


const MyLottieComponent = () => {
  const defaultOptions = {
    animationData: jsonAnimation,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(defaultOptions);

  return (
    <>{View}
    </>
  );
};

export default MyLottieComponent;