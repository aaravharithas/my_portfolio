/**
 * SplitText - React Bits style text animation (framer-motion implementation).
 * Splits text into chars or words and animates with stagger. Respects prefers-reduced-motion.
 */
import React, { useMemo } from "react";
import { motion } from "framer-motion";

const DEFAULT_FROM = { opacity: 0, y: 24 };
const DEFAULT_TO = { opacity: 1, y: 0 };

export default function SplitText({
  text = "",
  tag: Tag = "p",
  className = "",
  splitType = "chars",
  delay = 50,
  duration = 0.6,
  from = DEFAULT_FROM,
  to = DEFAULT_TO,
  textAlign = "left",
  reduceMotion = false,
  ...rest
}) {
  const chunks = useMemo(() => {
    if (!text) return [];
    if (splitType === "chars") {
      return text.split("");
    }
    if (splitType === "words") {
      return text.split(/\s+/).filter(Boolean);
    }
    if (splitType === "lines") {
      return text.split("\n").filter(Boolean);
    }
    // "words, chars" - array of words, each word is array of chars (we flatten to [word0char0, word0char1, ..., word1char0, ...] with space between words)
    if (splitType === "words, chars" || splitType === "words,chars") {
      return text.split(/\s+/).reduce((acc, word, i) => {
        if (i > 0) acc.push(" ");
        acc.push(...word.split(""));
        return acc;
      }, []);
    }
    return text.split("");
  }, [text, splitType]);

  const { style: restStyle, ...tagRest } = rest;
  const containerStyle = {
    textAlign,
    display: splitType === "lines" ? "block" : "inline",
    overflow: "hidden",
    ...restStyle,
  };

  if (reduceMotion || !chunks.length) {
    return (
      <Tag className={className} style={containerStyle} {...tagRest}>
        {text}
      </Tag>
    );
  }

  const isChar = splitType === "chars" || splitType === "words, chars" || splitType === "words,chars";
  const isSpace = (ch) => ch === " ";

  return (
    <Tag
      className={className}
      style={{ ...containerStyle, display: "inline-block" }}
      {...tagRest}
    >
      {chunks.map((chunk, i) => (
        <motion.span
          key={`${i}-${chunk}`}
          initial={from}
          animate={to}
          transition={{
            duration,
            delay: (i * delay) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            display: isChar && isSpace(chunk) ? "inline" : "inline-block",
            whiteSpace: isChar && isSpace(chunk) ? "pre" : "normal",
          }}
        >
          {chunk}
        </motion.span>
      ))}
    </Tag>
  );
}
