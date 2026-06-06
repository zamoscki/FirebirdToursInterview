import FastImage, { type FastImageProps } from '@d11/react-native-fast-image';

export type CachedImageProps = FastImageProps;

export function CachedImage(props: CachedImageProps) {
  return <FastImage {...props} />;
}
