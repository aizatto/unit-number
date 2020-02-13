import React, { useState, useEffect, useRef, useCallback } from 'react';

import lodashDebounce from 'lodash.debounce';
import querystring from 'querystring';

const debounce = lodashDebounce((fn: () => void) => {
  fn();
}, 500);

/**
 * goal is to fill the screen
 * 
 * Given the width of a screen, and the width of the textarea, how big of a textarea do I need to change the screen?
 * textarea width should be as close to innerWidth as possible
 * 
 * Should also consider the height, if its taller than the screen it's also useless, but I don't think that would ever happen
 */
function calculateFontSize(
  currentFontSize: number,
  innerWidth: number,
  textareaWidth: number,
): number {
  const margin = 0.20;
  const lowerBound = innerWidth * (1 - margin);
  const upperBound = innerWidth * (1 + margin);

  // console.log({
  //   innerWidth,
  //   lowerBound,
  //   upperBound,
  //   textareaWidth,
  // });

  if (upperBound < textareaWidth) {
    return currentFontSize * 0.85;
  } else if (textareaWidth < lowerBound) {
    return currentFontSize * 1.15;
  }

  return currentFontSize;
}

export const Field: React.FC<{}> = (props) => {
  const [params] = useState(() => {
    return querystring.parse(window.location.search.substr(1));
  });
  const [content, setContent] = useState(() => {
    return Array.isArray(params.unitNumber)
      ? params.unitNumber.join(' ')
      : (params.unitNumber ?? 'F-7-24');
  });
  const [transform, setTransform] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const ref = useRef<HTMLSpanElement>(null);
  // const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  const resizeTextArea = useCallback(() => {
    if (!ref.current) {
      return;
    }

    // console.log(ref.current.textLength)

    // setInnerWidth(window.innerWidth);
    const newFontSize = calculateFontSize(
      fontSize,
      window.innerWidth,
      ref.current.clientWidth
    )
    // console.log({newFontSize});
    setFontSize(newFontSize);
  }, [fontSize]);
  // console.log({fontSize});

  useEffect(() => {
    resizeTextArea();
  }, [content, fontSize]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // console.log('useLayoutEffect');
    const resizeListener = () => {
      resizeTextArea();

      // vertical orientation
      // console.log('rotate');
      if (window.innerWidth < (window.innerHeight * 0.9)) {
        setTransform('rotate(90deg)');
      } else {
        setTransform('');
      }
    };

    window.addEventListener('resize', resizeListener);
    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, []);; // eslint-disable-line react-hooks/exhaustive-deps

  const style = {
    fontSize,
    transform,
  };

  return (
      <span
        ref={ref}
        style={style}
        defaultValue={content}
        contentEditable
        onInput={(event) => {
          // @ts-ignore
          const value = event.target.innerText;
          debounce(() => {
            params.unitNumber = value;
            window.history.pushState(
              { content: value },
              '',
              '?' + querystring.stringify(params),
            );
            setContent(value);
          });
        }}
      >{content}</span>
  );
}