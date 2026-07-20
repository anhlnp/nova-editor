import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  useContext,
} from "react";
import { Image as WebstudioImage } from "@webstudio-is/image";
import { ReactSdkContext } from "@webstudio-is/react-sdk/runtime";

export const defaultTag = "img";

type Props = Omit<ComponentPropsWithoutRef<typeof WebstudioImage>, "loader">;

export const Image = forwardRef<
  ElementRef<typeof defaultTag>,
  Props & { $webstudio$canvasOnly$assetId?: string | undefined; objectfit?: string }
>(
  (
    {
      loading = "lazy",
      width,
      height,
      optimize = true,
      decoding: decodingProp,
      // @todo: it is a hack made for the builder and should not be in the runtime at all.
      $webstudio$canvasOnly$assetId,
      objectfit,
      style: styleProp,
      ...props
    },
    ref
  ) => {
    // cast to string when invalid value type is provided with binding
    const src = String(props.src ?? "");

    const { imageLoader, renderer } = useContext(ReactSdkContext);

    let decoding = decodingProp;

    let key = src;

    if (renderer === "canvas") {
      // With disabled cache and loading lazy, chrome may not render the image at all
      loading = "eager";

      // Avoid image flickering on switching from preview to asset (during upload)
      decoding = "sync";

      // use assetId as key to not recreate the image if it is switched from uploading to uploaded asset state
      key = $webstudio$canvasOnly$assetId ?? src;

      // NaN width and height means that the image is not yet uploaded, and should not be optimized on canvas
      if (
        width !== undefined &&
        height !== undefined &&
        Number.isNaN(width) &&
        Number.isNaN(height)
      ) {
        optimize = false;
        width = undefined;
        height = undefined;
      }
    }

    // Build inline style to enforce width/height constraints and object-fit
    const mergedStyle: React.CSSProperties = { ...styleProp as React.CSSProperties };
    if (width !== undefined && !Number.isNaN(Number(width))) {
      mergedStyle.width = `${width}px`;
    }
    if (height !== undefined && !Number.isNaN(Number(height))) {
      mergedStyle.height = `${height}px`;
    }
    if (objectfit) {
      mergedStyle.objectFit = objectfit as React.CSSProperties["objectFit"];
    }

    return (
      <WebstudioImage
        key={key}
        loading={loading}
        decoding={decoding}
        optimize={optimize}
        width={width}
        height={height}
        {...props}
        loader={imageLoader}
        src={src}
        style={mergedStyle}
        ref={ref}
      />
    );
  }
);

Image.displayName = "Image";