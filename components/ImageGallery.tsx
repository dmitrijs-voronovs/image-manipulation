import {FC} from "react";

type ImageGalleryProps = {
    changeImage(src: string): void
}
export const ImageGallery: FC<ImageGalleryProps> = ({changeImage}) => <>{Array.from({length: 25}).map((_, i) => {
    const src = `/${i < 10 ? '0' + i : i}.jpg`;
    return <img style={{width: 100, height: 100}} key={src} alt={src} src={src}
                onClick={() => changeImage(src)}/>
})}</>;