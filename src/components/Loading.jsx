import React from 'react'

import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="grid place-content-center px-4 py-24">
      <BarLoader />
    </div>
  );
};

const variants = {
  initial: {
    scaleY: 0.5,
    opacity: 0,
  },
  animate: {
    scaleY: 1,
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 1,
      ease: "circIn",
    },
  },
};

const BarLoader = () => {
  return (
    <motion.div
      transition={{
        staggerChildren: 0.25,
      }}
      initial="initial"
      animate="animate"
      className="flex gap-2"
    >
      <motion.div variants={variants} className="h-16 w-4 bg-blue-500 border-2 border-black" />
      <motion.div variants={variants} className="h-16 w-4 bg-purple-500 border-2 border-black" />
      <motion.div variants={variants} className="h-16 w-4 bg-pink-500 border-2 border-black" />
      <motion.div variants={variants} className="h-16 w-4 bg-yellow-400 border-2 border-black" />
      <motion.div variants={variants} className="h-16 w-4 bg-green-500 border-2 border-black" />
    </motion.div>
  );
};

export default Loading;