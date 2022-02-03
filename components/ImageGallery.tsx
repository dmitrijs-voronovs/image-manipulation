import {FC} from "react";
import {Button} from "antd";

type ImageGalleryProps = {
    changeImage(src: string): void
}
export const ImageGallery: FC<ImageGalleryProps> = ({changeImage}) => <>{Array.from({length: 25}).map((_, i) => {
    const src = `/${i < 10 ? '0' + i : i}.jpg`;
    return <Button key={src} onClick={() => changeImage(src)} style={{width: 100, height: 100, margin: 0, padding: 5 }}><img style={{width: 90, height: 90}} alt={src} src={src}
    /></Button>
})}</>;