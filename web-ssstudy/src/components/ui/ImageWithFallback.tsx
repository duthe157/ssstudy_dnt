import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = ImageProps & {
  fallbackSrc: string;
};

const ImageWithFallback = (props: Props) => {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...rest}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default ImageWithFallback;
