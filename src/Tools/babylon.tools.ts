﻿module BABYLON {
    export interface IAnimatable {
        animations: Array<Animation>;
    }

    // See https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
    // and https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    export class LoadFileError extends Error {
        // Polyfill for Object.setPrototypeOf if necessary.
        private static _setPrototypeOf: (o: any, proto: object | null) => any =
            (Object as any).setPrototypeOf || ((o, proto) => { o.__proto__ = proto; return o; });

        constructor(message: string, public request?: XMLHttpRequest) {
            super(message);
            this.name = "LoadFileError";

            LoadFileError._setPrototypeOf(this, LoadFileError.prototype);
        }
    }

    export class RetryStrategy {
        public static ExponentialBackoff(maxRetries = 3, baseInterval = 500) {
            return (url: string, request: XMLHttpRequest, retryIndex: number): number => {
                if (request.status !== 0 || retryIndex >= maxRetries || url.indexOf("file:") !== -1) {
                    return -1;
                }

                return Math.pow(2, retryIndex) * baseInterval;
            };
        }
    }

    export interface IFileRequest {
        /**
         * Raised when the request is complete (success or error).
         */
        onCompleteObservable: Observable<IFileRequest>;

        /**
         * Aborts the request for a file.
         */
        abort: () => void;
    }

    // Screenshots
    var screenshotCanvas: HTMLCanvasElement;

    var cloneValue = (source: any, destinationObject: any) => {
        if (!source)
            return null;

        if (source instanceof Mesh) {
            return null;
        }

        if (source instanceof SubMesh) {
            return source.clone(destinationObject);
        } else if (source.clone) {
            return source.clone();
        }
        return null;
    };

    export class Tools {
        public static BaseUrl = "";
        public static DefaultRetryStrategy = RetryStrategy.ExponentialBackoff();

        /**
         * Default behaviour for cors in the application.
         * It can be a string if the expected behavior is identical in the entire app.
         * Or a callback to be able to set it per url or on a group of them (in case of Video source for instance)
         */
        public static CorsBehavior: string | ((url: string | string[]) => string) = "anonymous";

        public static UseFallbackTexture = true;

        /**
         * Use this object to register external classes like custom textures or material 
         * to allow the laoders to instantiate them
         */
        public static RegisteredExternalClasses: { [key: string]: Object } = {};

        // Used in case of a texture loading problem 
        public static fallbackTexture = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBmRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAExAAIAAAAQAAAATgAAAAAAAABgAAAAAQAAAGAAAAABcGFpbnQubmV0IDQuMC41AP/bAEMABAIDAwMCBAMDAwQEBAQFCQYFBQUFCwgIBgkNCw0NDQsMDA4QFBEODxMPDAwSGBITFRYXFxcOERkbGRYaFBYXFv/bAEMBBAQEBQUFCgYGChYPDA8WFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFv/AABEIAQABAAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APH6KKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76P//Z";

        /**
		 * Interpolates between a and b via alpha
		 * @param a The lower value (returned when alpha = 0)
		 * @param b The upper value (returned when alpha = 1)
		 * @param alpha The interpolation-factor
		 * @return The mixed value
		 */
        public static Mix(a: number, b: number, alpha: number): number {
            return a * (1 - alpha) + b * alpha;
        }

        public static Instantiate(className: string): any {
            if (Tools.RegisteredExternalClasses && Tools.RegisteredExternalClasses[className]) {
                return Tools.RegisteredExternalClasses[className];
            }

            var arr = className.split(".");

            var fn: any = (window || this);
            for (var i = 0, len = arr.length; i < len; i++) {
                fn = fn[arr[i]];
            }

            if (typeof fn !== "function") {
                return null;
            }

            return fn;
        }

        /**
         * Provides a slice function that will work even on IE
         * @param data defines the array to slice
         * @returns the new sliced array
         */
        public static Slice(data: FloatArray): FloatArray {
            if (data.slice) {
                return data.slice();
            }

            return Array.prototype.slice.call(data);
        }

        public static SetImmediate(action: () => void) {
            if (window.setImmediate) {
                window.setImmediate(action);
            } else {
                setTimeout(action, 1);
            }
        }

        public static IsExponentOfTwo(value: number): boolean {
            var count = 1;

            do {
                count *= 2;
            } while (count < value);

            return count === value;
        }

		/**
		 * Find the next highest power of two.
		 * @param x Number to start search from.
		 * @return Next highest power of two.
		 */
        public static CeilingPOT(x: number): number {
            x--;
            x |= x >> 1;
            x |= x >> 2;
            x |= x >> 4;
            x |= x >> 8;
            x |= x >> 16;
            x++;
            return x;
        }

		/**
		 * Find the next lowest power of two.
		 * @param x Number to start search from.
		 * @return Next lowest power of two.
		 */
        public static FloorPOT(x: number): number {
            x = x | (x >> 1);
            x = x | (x >> 2);
            x = x | (x >> 4);
            x = x | (x >> 8);
            x = x | (x >> 16);
            return x - (x >> 1);
        }

		/**
		 * Find the nearest power of two.
		 * @param x Number to start search from.
		 * @return Next nearest power of two.
		 */
        public static NearestPOT(x: number): number {
            var c = Tools.CeilingPOT(x);
            var f = Tools.FloorPOT(x);
            return (c - x) > (x - f) ? f : c;
        }

        public static GetExponentOfTwo(value: number, max: number, mode = Engine.SCALEMODE_NEAREST): number {
            let pot;

            switch (mode) {
                case Engine.SCALEMODE_FLOOR:
                    pot = Tools.FloorPOT(value);
                    break;
                case Engine.SCALEMODE_NEAREST:
                    pot = Tools.NearestPOT(value);
                    break;
                case Engine.SCALEMODE_CEILING:
                default:
                    pot = Tools.CeilingPOT(value);
                    break;
            }

            return Math.min(pot, max);
        }

        public static GetFilename(path: string): string {
            var index = path.lastIndexOf("/");
            if (index < 0)
                return path;

            return path.substring(index + 1);
        }

        /**
         * Extracts the "folder" part of a path (everything before the filename).
         * @param uri The URI to extract the info from
         * @param returnUnchangedIfNoSlash Do not touch the URI if no slashes are present
         * @returns The "folder" part of the path
         */
        public static GetFolderPath(uri: string, returnUnchangedIfNoSlash = false): string {
            var index = uri.lastIndexOf("/");
            if (index < 0) {
                if (returnUnchangedIfNoSlash) {
                    return uri;
                }
                return "";
            }

            return uri.substring(0, index + 1);
        }

        public static GetDOMTextContent(element: HTMLElement): string {
            var result = "";
            var child = element.firstChild;

            while (child) {
                if (child.nodeType === 3) {
                    result += child.textContent;
                }
                child = child.nextSibling;
            }

            return result;
        }

        public static ToDegrees(angle: number): number {
            return angle * 180 / Math.PI;
        }

        public static ToRadians(angle: number): number {
            return angle * Math.PI / 180;
        }

        public static EncodeArrayBufferTobase64(buffer: ArrayBuffer): string {
            var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            var bytes = new Uint8Array(buffer);

            while (i < bytes.length) {
                chr1 = bytes[i++];
                chr2 = i < bytes.length ? bytes[i++] : Number.NaN; // Not sure if the index 
                chr3 = i < bytes.length ? bytes[i++] : Number.NaN; // checks are needed here

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) + keyStr.charAt(enc4);
            }

            return "data:image/png;base64," + output;
        }

        public static ExtractMinAndMaxIndexed(positions: FloatArray, indices: IndicesArray, indexStart: number, indexCount: number, bias: Nullable<Vector2> = null): { minimum: Vector3; maximum: Vector3 } {
            var minimum = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            var maximum = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

            for (var index = indexStart; index < indexStart + indexCount; index++) {
                var current = new Vector3(positions[indices[index] * 3], positions[indices[index] * 3 + 1], positions[indices[index] * 3 + 2]);

                minimum = Vector3.Minimize(current, minimum);
                maximum = Vector3.Maximize(current, maximum);
            }

            if (bias) {
                minimum.x -= minimum.x * bias.x + bias.y;
                minimum.y -= minimum.y * bias.x + bias.y;
                minimum.z -= minimum.z * bias.x + bias.y;
                maximum.x += maximum.x * bias.x + bias.y;
                maximum.y += maximum.y * bias.x + bias.y;
                maximum.z += maximum.z * bias.x + bias.y;
            }

            return {
                minimum: minimum,
                maximum: maximum
            };
        }

        public static ExtractMinAndMax(positions: FloatArray, start: number, count: number, bias: Nullable<Vector2> = null, stride?: number): { minimum: Vector3; maximum: Vector3 } {
            var minimum = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            var maximum = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

            if (!stride) {
                stride = 3;
            }

            for (var index = start; index < start + count; index++) {
                var current = new Vector3(positions[index * stride], positions[index * stride + 1], positions[index * stride + 2]);

                minimum = Vector3.Minimize(current, minimum);
                maximum = Vector3.Maximize(current, maximum);
            }

            if (bias) {
                minimum.x -= minimum.x * bias.x + bias.y;
                minimum.y -= minimum.y * bias.x + bias.y;
                minimum.z -= minimum.z * bias.x + bias.y;
                maximum.x += maximum.x * bias.x + bias.y;
                maximum.y += maximum.y * bias.x + bias.y;
                maximum.z += maximum.z * bias.x + bias.y;
            }

            return {
                minimum: minimum,
                maximum: maximum
            };
        }

        public static Vector2ArrayFeeder(array: Array<Vector2> | Float32Array): (i: number) => Nullable<Vector2> {
            return (index: number) => {
                let isFloatArray = ((<Float32Array>array).BYTES_PER_ELEMENT !== undefined);
                let length = isFloatArray ? array.length / 2 : array.length;

                if (index >= length) {
                    return null;
                }

                if (isFloatArray) {
                    let fa = <Float32Array>array;
                    return new Vector2(fa[index * 2 + 0], fa[index * 2 + 1]);
                }
                let a = <Array<Vector2>>array;
                return a[index];
            };
        }

        public static ExtractMinAndMaxVector2(feeder: (index: number) => Vector2, bias: Nullable<Vector2> = null): { minimum: Vector2; maximum: Vector2 } {
            var minimum = new Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
            var maximum = new Vector2(-Number.MAX_VALUE, -Number.MAX_VALUE);

            let i = 0;
            let cur = feeder(i++);
            while (cur) {
                minimum = Vector2.Minimize(cur, minimum);
                maximum = Vector2.Maximize(cur, maximum);

                cur = feeder(i++);
            }

            if (bias) {
                minimum.x -= minimum.x * bias.x + bias.y;
                minimum.y -= minimum.y * bias.x + bias.y;
                maximum.x += maximum.x * bias.x + bias.y;
                maximum.y += maximum.y * bias.x + bias.y;
            }

            return {
                minimum: minimum,
                maximum: maximum
            };
        }

        public static MakeArray(obj: any, allowsNullUndefined?: boolean): Nullable<Array<any>> {
            if (allowsNullUndefined !== true && (obj === undefined || obj == null))
                return null;

            return Array.isArray(obj) ? obj : [obj];
        }

        // Misc.
        public static GetPointerPrefix(): string {
            var eventPrefix = "pointer";

            // Check if pointer events are supported
            if (Tools.IsWindowObjectExist() && !window.PointerEvent && !navigator.pointerEnabled) {
                eventPrefix = "mouse";
            }

            return eventPrefix;
        }

        /**
         * @param func - the function to be called
         * @param requester - the object that will request the next frame. Falls back to window.
         */
        public static QueueNewFrame(func: () => void, requester?: any): number {
            if (!Tools.IsWindowObjectExist()) {
                return setTimeout(func, 16);
            }

            if (!requester) {
                requester = window;
            }

            if (requester.requestAnimationFrame) {
                return requester.requestAnimationFrame(func);
            }
            else if (requester.msRequestAnimationFrame) {
                return requester.msRequestAnimationFrame(func);
            }
            else if (requester.webkitRequestAnimationFrame) {
                return requester.webkitRequestAnimationFrame(func);
            }
            else if (requester.mozRequestAnimationFrame) {
                return requester.mozRequestAnimationFrame(func);
            }
            else if (requester.oRequestAnimationFrame) {
                return requester.oRequestAnimationFrame(func);
            }
            else {
                return window.setTimeout(func, 16);
            }
        }

        public static RequestFullscreen(element: HTMLElement): void {
            var requestFunction = element.requestFullscreen || (<any>element).msRequestFullscreen || element.webkitRequestFullscreen || (<any>element).mozRequestFullScreen;
            if (!requestFunction) return;
            requestFunction.call(element);
        }

        public static ExitFullscreen(): void {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            else if (document.msCancelFullScreen) {
                document.msCancelFullScreen();
            }
        }

        public static SetCorsBehavior(url: string | string[], element: { crossOrigin: string | null }): void {
            if (url && url.indexOf("data:") === 0) {
                return;
            }

            if (Tools.CorsBehavior) {
                if (typeof (Tools.CorsBehavior) === 'string' || Tools.CorsBehavior instanceof String) {
                    element.crossOrigin = <string>Tools.CorsBehavior;
                }
                else {
                    var result = Tools.CorsBehavior(url);
                    if (result) {
                        element.crossOrigin = result;
                    }
                }
            }
        }

        // External files
        public static CleanUrl(url: string): string {
            url = url.replace(/#/mg, "%23");
            return url;
        }

        public static PreprocessUrl = (url: string) => {
            return url;
        }

        public static LoadImage(url: any, onLoad: (img: HTMLImageElement) => void, onError: (message?: string, exception?: any) => void, database: Nullable<Database>): HTMLImageElement {
            if (url instanceof ArrayBuffer) {
                url = Tools.EncodeArrayBufferTobase64(url);
            }

            url = Tools.CleanUrl(url);

            url = Tools.PreprocessUrl(url);

            var img = new Image();
            Tools.SetCorsBehavior(url, img);

            const loadHandler = () => {
                img.removeEventListener("load", loadHandler);
                img.removeEventListener("error", errorHandler);
                onLoad(img);
            };

            const errorHandler = (err: any) => {
                img.removeEventListener("load", loadHandler);
                img.removeEventListener("error", errorHandler);

                Tools.Error("Error while trying to load image: " + url);

                if (onError) {
                    onError("Error while trying to load image: " + url, err);
                }
            };

            img.addEventListener("load", loadHandler);
            img.addEventListener("error", errorHandler);

            var noIndexedDB = () => {
                img.src = url;
            };

            var loadFromIndexedDB = () => {
                if (database) {
                    database.loadImageFromDB(url, img);
                }
            };


            //ANY database to do!
            if (url.substr(0, 5) !== "data:" && database && database.enableTexturesOffline && Database.IsUASupportingBlobStorage) {
                database.openAsync(loadFromIndexedDB, noIndexedDB);
            }
            else {
                if (url.indexOf("file:") !== -1) {
                    var textureName = decodeURIComponent(url.substring(5).toLowerCase());
                    if (FilesInput.FilesToLoad[textureName]) {
                        try {
                            var blobURL;
                            try {
                                blobURL = URL.createObjectURL(FilesInput.FilesToLoad[textureName], { oneTimeOnly: true });
                            }
                            catch (ex) {
                                // Chrome doesn't support oneTimeOnly parameter
                                blobURL = URL.createObjectURL(FilesInput.FilesToLoad[textureName]);
                            }
                            img.src = blobURL;
                        }
                        catch (e) {
                            img.src = "";
                        }
                        return img;
                    }
                }

                noIndexedDB();
            }

            return img;
        }

        public static LoadFile(url: string, onSuccess: (data: string | ArrayBuffer, responseURL?: string) => void, onProgress?: (data: any) => void, database?: Database, useArrayBuffer?: boolean, onError?: (request?: XMLHttpRequest, exception?: any) => void): IFileRequest {
            url = Tools.CleanUrl(url);

            url = Tools.PreprocessUrl(url);

            // If file and file input are set
            if (url.indexOf("file:") !== -1) {
                const fileName = decodeURIComponent(url.substring(5).toLowerCase());
                if (FilesInput.FilesToLoad[fileName]) {
                    return Tools.ReadFile(FilesInput.FilesToLoad[fileName], onSuccess, onProgress, useArrayBuffer);
                }
            }

            const loadUrl = Tools.BaseUrl + url;

            let aborted = false;
            const fileRequest: IFileRequest = {
                onCompleteObservable: new Observable<IFileRequest>(),
                abort: () => aborted = true,
            };

            const requestFile = () => {
                let request = new XMLHttpRequest();
                let retryHandle: Nullable<number> = null;

                fileRequest.abort = () => {
                    aborted = true;

                    if (request.readyState !== (XMLHttpRequest.DONE || 4)) {
                        request.abort();
                    }

                    if (retryHandle !== null) {
                        clearTimeout(retryHandle);
                        retryHandle = null;
                    }
                };

                const retryLoop = (retryIndex: number) => {
                    request.open('GET', loadUrl, true);

                    if (useArrayBuffer) {
                        request.responseType = "arraybuffer";
                    }

                    if (onProgress) {
                        request.addEventListener("progress", onProgress);
                    }

                    const onLoadEnd = () => {
                        request.removeEventListener("loadend", onLoadEnd);
                        fileRequest.onCompleteObservable.notifyObservers(fileRequest);
                        fileRequest.onCompleteObservable.clear();
                    };

                    request.addEventListener("loadend", onLoadEnd);

                    const onReadyStateChange = () => {
                        if (aborted) {
                            return;
                        }

                        // In case of undefined state in some browsers.
                        if (request.readyState === (XMLHttpRequest.DONE || 4)) {
                            // Some browsers have issues where onreadystatechange can be called multiple times with the same value.
                            request.removeEventListener("readystatechange", onReadyStateChange);

                            if (request.status >= 200 && request.status < 300 || (!Tools.IsWindowObjectExist() && (request.status === 0))) {
                                onSuccess(!useArrayBuffer ? request.responseText : <ArrayBuffer>request.response, request.responseURL);
                                return;
                            }

                            let retryStrategy = Tools.DefaultRetryStrategy;
                            if (retryStrategy) {
                                let waitTime = retryStrategy(loadUrl, request, retryIndex);
                                if (waitTime !== -1) {
                                    // Prevent the request from completing for retry.
                                    request.removeEventListener("loadend", onLoadEnd);
                                    request = new XMLHttpRequest();
                                    retryHandle = setTimeout(() => retryLoop(retryIndex + 1), waitTime);
                                    return;
                                }
                            }

                            let e = new LoadFileError("Error status: " + request.status + " " + request.statusText + " - Unable to load " + loadUrl, request);
                            if (onError) {
                                onError(request, e);
                            } else {
                                throw e;
                            }
                        }
                    };

                    request.addEventListener("readystatechange", onReadyStateChange);

                    request.send();
                };

                retryLoop(0);
            };

            // Caching all files
            if (database && database.enableSceneOffline) {
                const noIndexedDB = () => {
                    if (!aborted) {
                        requestFile();
                    }
                };

                const loadFromIndexedDB = () => {
                    // TODO: database needs to support aborting and should return a IFileRequest
                    if (aborted) {
                        return;
                    }

                    if (database) {
                        database.loadFileFromDB(url, data => {
                            if (!aborted) {
                                onSuccess(data);
                            }

                            fileRequest.onCompleteObservable.notifyObservers(fileRequest);
                        }, onProgress ? event => {
                            if (!aborted) {
                                onProgress(event);
                            }
                        } : undefined, noIndexedDB, useArrayBuffer);
                    }
                };

                database.openAsync(loadFromIndexedDB, noIndexedDB);
            }
            else {
                requestFile();
            }

            return fileRequest;
        }

        /** 
         * Load a script (identified by an url). When the url returns, the 
         * content of this file is added into a new script element, attached to the DOM (body element)
         */
        public static LoadScript(scriptUrl: string, onSuccess: () => void, onError?: (message?: string, exception?: any) => void) {
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = scriptUrl;

            script.onload = () => {
                if (onSuccess) {
                    onSuccess();
                }
            };

            script.onerror = (e) => {
                if (onError) {
                    onError("Unable to load script", e);
                }
            };

            head.appendChild(script);
        }

        public static ReadFileAsDataURL(fileToLoad: Blob, callback: (data: any) => void, progressCallback: (this: MSBaseReader, ev: ProgressEvent) => any): IFileRequest {
            let reader = new FileReader();

            let request: IFileRequest = {
                onCompleteObservable: new Observable<IFileRequest>(),
                abort: () => reader.abort(),
            };

            reader.onloadend = e => {
                request.onCompleteObservable.notifyObservers(request);
            };

            reader.onload = e => {
                //target doesn't have result from ts 1.3
                callback((<any>e.target)['result']);
            };

            reader.onprogress = progressCallback;

            reader.readAsDataURL(fileToLoad);

            return request;
        }

        public static ReadFile(fileToLoad: File, callback: (data: any) => void, progressCallBack?: (this: MSBaseReader, ev: ProgressEvent) => any, useArrayBuffer?: boolean): IFileRequest {
            let reader = new FileReader();
            let request: IFileRequest = {
                onCompleteObservable: new Observable<IFileRequest>(),
                abort: () => reader.abort(),
            };

            reader.onloadend = e => request.onCompleteObservable.notifyObservers(request);
            reader.onerror = e => {
                Tools.Log("Error while reading file: " + fileToLoad.name);
                callback(JSON.stringify({ autoClear: true, clearColor: [1, 0, 0], ambientColor: [0, 0, 0], gravity: [0, -9.807, 0], meshes: [], cameras: [], lights: [] }));
            };
            reader.onload = e => {
                //target doesn't have result from ts 1.3
                callback((<any>e.target)['result']);
            };
            if (progressCallBack) {
                reader.onprogress = progressCallBack;
            }
            if (!useArrayBuffer) {
                // Asynchronous read
                reader.readAsText(fileToLoad);
            }
            else {
                reader.readAsArrayBuffer(fileToLoad);
            }

            return request;
        }

        //returns a downloadable url to a file content.
        public static FileAsURL(content: string): string {
            var fileBlob = new Blob([content]);
            var url = window.URL || window.webkitURL;
            var link: string = url.createObjectURL(fileBlob);
            return link;
        }

        // Misc.
        public static Format(value: number, decimals: number = 2): string {
            return value.toFixed(decimals);
        }

        public static CheckExtends(v: Vector3, min: Vector3, max: Vector3): void {
            if (v.x < min.x)
                min.x = v.x;
            if (v.y < min.y)
                min.y = v.y;
            if (v.z < min.z)
                min.z = v.z;

            if (v.x > max.x)
                max.x = v.x;
            if (v.y > max.y)
                max.y = v.y;
            if (v.z > max.z)
                max.z = v.z;
        }

        public static DeepCopy(source: any, destination: any, doNotCopyList?: string[], mustCopyList?: string[]): void {
            for (var prop in source) {

                if (prop[0] === "_" && (!mustCopyList || mustCopyList.indexOf(prop) === -1)) {
                    continue;
                }

                if (doNotCopyList && doNotCopyList.indexOf(prop) !== -1) {
                    continue;
                }

                let descriptor = Object.getOwnPropertyDescriptor(source, prop);
                //descriptor should exist, should be writable, and should not be a getter.
                if (!descriptor || !descriptor.writable || descriptor.get) {
                    continue;
                }
                var sourceValue = source[prop];
                var typeOfSourceValue = typeof sourceValue;

                if (typeOfSourceValue === "function") {
                    continue;
                }

                if (typeOfSourceValue === "object") {
                    if (sourceValue instanceof Array) {
                        destination[prop] = [];

                        if (sourceValue.length > 0) {
                            if (typeof sourceValue[0] == "object") {
                                for (var index = 0; index < sourceValue.length; index++) {
                                    var clonedValue = cloneValue(sourceValue[index], destination);

                                    if (destination[prop].indexOf(clonedValue) === -1) { // Test if auto inject was not done
                                        destination[prop].push(clonedValue);
                                    }
                                }
                            } else {
                                destination[prop] = sourceValue.slice(0);
                            }
                        }
                    } else {
                        destination[prop] = cloneValue(sourceValue, destination);
                    }
                } else {
                    destination[prop] = sourceValue;
                }
            }
        }

        public static IsEmpty(obj: any): boolean {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        }

        public static RegisterTopRootEvents(events: { name: string; handler: Nullable<(e: FocusEvent) => any> }[]): void {
            for (var index = 0; index < events.length; index++) {
                var event = events[index];
                window.addEventListener(event.name, <any>event.handler, false);

                try {
                    if (window.parent) {
                        window.parent.addEventListener(event.name, <any>event.handler, false);
                    }
                } catch (e) {
                    // Silently fails...
                }
            }
        }

        public static UnregisterTopRootEvents(events: { name: string; handler: Nullable<(e: FocusEvent) => any> }[]): void {
            for (var index = 0; index < events.length; index++) {
                var event = events[index];
                window.removeEventListener(event.name, <any>event.handler);

                try {
                    if (window.parent) {
                        window.parent.removeEventListener(event.name, <any>event.handler);
                    }
                } catch (e) {
                    // Silently fails...
                }
            }
        }

        public static DumpFramebuffer(width: number, height: number, engine: Engine, successCallback?: (data: string) => void, mimeType: string = "image/png", fileName?: string): void {
            // Read the contents of the framebuffer
            var numberOfChannelsByLine = width * 4;
            var halfHeight = height / 2;

            //Reading datas from WebGL
            var data = engine.readPixels(0, 0, width, height);

            //To flip image on Y axis.
            for (var i = 0; i < halfHeight; i++) {
                for (var j = 0; j < numberOfChannelsByLine; j++) {
                    var currentCell = j + i * numberOfChannelsByLine;
                    var targetLine = height - i - 1;
                    var targetCell = j + targetLine * numberOfChannelsByLine;

                    var temp = data[currentCell];
                    data[currentCell] = data[targetCell];
                    data[targetCell] = temp;
                }
            }

            // Create a 2D canvas to store the result
            if (!screenshotCanvas) {
                screenshotCanvas = document.createElement('canvas');
            }
            screenshotCanvas.width = width;
            screenshotCanvas.height = height;
            var context = screenshotCanvas.getContext('2d');

            if (context) {
                // Copy the pixels to a 2D canvas
                var imageData = context.createImageData(width, height);
                var castData = <any>(imageData.data);
                castData.set(data);
                context.putImageData(imageData, 0, 0);

                Tools.EncodeScreenshotCanvasData(successCallback, mimeType, fileName);
            }
        }

        static EncodeScreenshotCanvasData(successCallback?: (data: string) => void, mimeType: string = "image/png", fileName?: string) {
            var base64Image = screenshotCanvas.toDataURL(mimeType);
            if (successCallback) {
                successCallback(base64Image);
            }
            else {
                // We need HTMLCanvasElement.toBlob for HD screenshots
                if (!screenshotCanvas.toBlob) {
                    //  low performance polyfill based on toDataURL (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
                    screenshotCanvas.toBlob = function (callback, type, quality) {
                        setTimeout(() => {
                            var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                                len = binStr.length,
                                arr = new Uint8Array(len);

                            for (var i = 0; i < len; i++) {
                                arr[i] = binStr.charCodeAt(i);
                            }
                            callback(new Blob([arr], { type: type || 'image/png' }));
                        });
                    }
                }
                screenshotCanvas.toBlob(function (blob) {
                    var url = URL.createObjectURL(blob);
                    //Creating a link if the browser have the download attribute on the a tag, to automatically start download generated image.
                    if (("download" in document.createElement("a"))) {
                        var a = window.document.createElement("a");
                        a.href = url;
                        if (fileName) {
                            a.setAttribute("download", fileName);
                        }
                        else {
                            var date = new Date();
                            var stringDate = (date.getFullYear() + "-" + (date.getMonth() + 1)).slice(-2) + "-" + date.getDate() + "_" + date.getHours() + "-" + ('0' + date.getMinutes()).slice(-2);
                            a.setAttribute("download", "screenshot_" + stringDate + ".png");
                        }
                        window.document.body.appendChild(a);
                        a.addEventListener("click", () => {
                            if (a.parentElement) {
                                a.parentElement.removeChild(a);
                            }
                        });
                        a.click();
                    }
                    else {
                        var newWindow = window.open("");
                        if (!newWindow) return;
                        var img = newWindow.document.createElement("img");
                        img.onload = function () {
                            // no longer need to read the blob so it's revoked
                            URL.revokeObjectURL(url);
                        };
                        img.src = url;
                        newWindow.document.body.appendChild(img);
                    }

                });
            }
        }

        public static CreateScreenshot(engine: Engine, camera: Camera, size: any, successCallback?: (data: string) => void, mimeType: string = "image/png"): void {
            var width: number;
            var height: number;

            // If a precision value is specified
            if (size.precision) {
                width = Math.round(engine.getRenderWidth() * size.precision);
                height = Math.round(width / engine.getAspectRatio(camera));
            }
            else if (size.width && size.height) {
                width = size.width;
                height = size.height;
            }
            //If passing only width, computing height to keep display canvas ratio.
            else if (size.width && !size.height) {
                width = size.width;
                height = Math.round(width / engine.getAspectRatio(camera));
            }
            //If passing only height, computing width to keep display canvas ratio.
            else if (size.height && !size.width) {
                height = size.height;
                width = Math.round(height * engine.getAspectRatio(camera));
            }
            //Assuming here that "size" parameter is a number
            else if (!isNaN(size)) {
                height = size;
                width = size;
            }
            else {
                Tools.Error("Invalid 'size' parameter !");
                return;
            }

            if (!screenshotCanvas) {
                screenshotCanvas = document.createElement('canvas');
            }

            screenshotCanvas.width = width;
            screenshotCanvas.height = height;

            var renderContext = screenshotCanvas.getContext("2d");

            var ratio = engine.getRenderWidth() / engine.getRenderHeight();
            var newWidth = width;
            var newHeight = newWidth / ratio;
            if (newHeight > height) {
                newHeight = height;
                newWidth = newHeight * ratio;
            }

            var offsetX = Math.max(0, width - newWidth) / 2;
            var offsetY = Math.max(0, height - newHeight) / 2;

            var renderingCanvas = engine.getRenderingCanvas();
            if (renderContext && renderingCanvas) {
                renderContext.drawImage(renderingCanvas, offsetX, offsetY, newWidth, newHeight);
            }

            Tools.EncodeScreenshotCanvasData(successCallback, mimeType);
        }

        /**
         * Generates an image screenshot from the specified camera.
         *
         * @param engine The engine to use for rendering
         * @param camera The camera to use for rendering
         * @param size This parameter can be set to a single number or to an object with the
         * following (optional) properties: precision, width, height. If a single number is passed,
         * it will be used for both width and height. If an object is passed, the screenshot size
         * will be derived from the parameters. The precision property is a multiplier allowing
         * rendering at a higher or lower resolution.
         * @param successCallback The callback receives a single parameter which contains the
         * screenshot as a string of base64-encoded characters. This string can be assigned to the
         * src parameter of an <img> to display it.
         * @param mimeType The MIME type of the screenshot image (default: image/png).
         * Check your browser for supported MIME types.
         * @param samples Texture samples (default: 1)
         * @param antialiasing Whether antialiasing should be turned on or not (default: false)
         * @param fileName A name for for the downloaded file.
         * @constructor
         */
        public static CreateScreenshotUsingRenderTarget(engine: Engine, camera: Camera, size: any, successCallback?: (data: string) => void, mimeType: string = "image/png", samples: number = 1, antialiasing: boolean = false, fileName?: string): void {
            var width: number;
            var height: number;

            //If a precision value is specified
            if (size.precision) {
                width = Math.round(engine.getRenderWidth() * size.precision);
                height = Math.round(width / engine.getAspectRatio(camera));
                size = { width: width, height: height };
            }
            else if (size.width && size.height) {
                width = size.width;
                height = size.height;
            }
            //If passing only width, computing height to keep display canvas ratio.
            else if (size.width && !size.height) {
                width = size.width;
                height = Math.round(width / engine.getAspectRatio(camera));
                size = { width: width, height: height };
            }
            //If passing only height, computing width to keep display canvas ratio.
            else if (size.height && !size.width) {
                height = size.height;
                width = Math.round(height * engine.getAspectRatio(camera));
                size = { width: width, height: height };
            }
            //Assuming here that "size" parameter is a number
            else if (!isNaN(size)) {
                height = size;
                width = size;
            }
            else {
                Tools.Error("Invalid 'size' parameter !");
                return;
            }

            var scene = camera.getScene();
            var previousCamera: Nullable<Camera> = null;

            if (scene.activeCamera !== camera) {
                previousCamera = scene.activeCamera;
                scene.activeCamera = camera;
            }

            //At this point size can be a number, or an object (according to engine.prototype.createRenderTargetTexture method)
            var texture = new RenderTargetTexture("screenShot", size, scene, false, false, Engine.TEXTURETYPE_UNSIGNED_INT, false, Texture.NEAREST_SAMPLINGMODE);
            texture.renderList = null;
            texture.samples = samples;
            if (antialiasing) {
                texture.addPostProcess(new FxaaPostProcess('antialiasing', 1.0, scene.activeCamera));
            }
            texture.onAfterRenderObservable.add(() => {
                Tools.DumpFramebuffer(width, height, engine, successCallback, mimeType, fileName);
            });

            scene.incrementRenderId();
            scene.resetCachedMaterial();
            texture.render(true);
            texture.dispose();

            if (previousCamera) {
                scene.activeCamera = previousCamera;
            }

            camera.getProjectionMatrix(true); // Force cache refresh;
        }

        // XHR response validator for local file scenario
        public static ValidateXHRData(xhr: XMLHttpRequest, dataType = 7): boolean {
            // 1 for text (.babylon, manifest and shaders), 2 for TGA, 4 for DDS, 7 for all

            try {
                if (dataType & 1) {
                    if (xhr.responseText && xhr.responseText.length > 0) {
                        return true;
                    } else if (dataType === 1) {
                        return false;
                    }
                }

                if (dataType & 2) {
                    // Check header width and height since there is no "TGA" magic number
                    var tgaHeader = TGATools.GetTGAHeader(xhr.response);

                    if (tgaHeader.width && tgaHeader.height && tgaHeader.width > 0 && tgaHeader.height > 0) {
                        return true;
                    } else if (dataType === 2) {
                        return false;
                    }
                }

                if (dataType & 4) {
                    // Check for the "DDS" magic number
                    var ddsHeader = new Uint8Array(xhr.response, 0, 3);

                    if (ddsHeader[0] === 68 && ddsHeader[1] === 68 && ddsHeader[2] === 83) {
                        return true;
                    } else {
                        return false;
                    }
                }

            } catch (e) {
                // Global protection
            }

            return false;
        }

        /**
         * Implementation from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#answer-2117523
         * Be aware Math.random() could cause collisions, but:
         * "All but 6 of the 128 bits of the ID are randomly generated, which means that for any two ids, there's a 1 in 2^^122 (or 5.3x10^^36) chance they'll collide"
         */
        public static RandomId(): string {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        /**
        * Test if the given uri is a base64 string.
        * @param uri The uri to test
        * @return True if the uri is a base64 string or false otherwise.
        */
        public static IsBase64(uri: string): boolean {
            return uri.length < 5 ? false : uri.substr(0, 5) === "data:";
        }

        /**
        * Decode the given base64 uri.
        * @param uri The uri to decode
        * @return The decoded base64 data.
        */
        public static DecodeBase64(uri: string): ArrayBuffer {
            const decodedString = atob(uri.split(",")[1]);
            const bufferLength = decodedString.length;
            const bufferView = new Uint8Array(new ArrayBuffer(bufferLength));

            for (let i = 0; i < bufferLength; i++) {
                bufferView[i] = decodedString.charCodeAt(i);
            }

            return bufferView.buffer;
        }

        // Logs
        private static _NoneLogLevel = 0;
        private static _MessageLogLevel = 1;
        private static _WarningLogLevel = 2;
        private static _ErrorLogLevel = 4;
        private static _LogCache = "";

        public static errorsCount = 0;
        public static OnNewCacheEntry: (entry: string) => void;

        static get NoneLogLevel(): number {
            return Tools._NoneLogLevel;
        }

        static get MessageLogLevel(): number {
            return Tools._MessageLogLevel;
        }

        static get WarningLogLevel(): number {
            return Tools._WarningLogLevel;
        }

        static get ErrorLogLevel(): number {
            return Tools._ErrorLogLevel;
        }

        static get AllLogLevel(): number {
            return Tools._MessageLogLevel | Tools._WarningLogLevel | Tools._ErrorLogLevel;
        }

        private static _AddLogEntry(entry: string) {
            Tools._LogCache = entry + Tools._LogCache;

            if (Tools.OnNewCacheEntry) {
                Tools.OnNewCacheEntry(entry);
            }
        }

        private static _FormatMessage(message: string): string {
            var padStr = (i: number) => (i < 10) ? "0" + i : "" + i;

            var date = new Date();
            return "[" + padStr(date.getHours()) + ":" + padStr(date.getMinutes()) + ":" + padStr(date.getSeconds()) + "]: " + message;
        }

        private static _LogDisabled(message: string): void {
            // nothing to do
        }
        private static _LogEnabled(message: string): void {
            var formattedMessage = Tools._FormatMessage(message);
            console.log("BJS - " + formattedMessage);

            var entry = "<div style='color:white'>" + formattedMessage + "</div><br>";
            Tools._AddLogEntry(entry);
        }

        private static _WarnDisabled(message: string): void {
            // nothing to do
        }
        private static _WarnEnabled(message: string): void {
            var formattedMessage = Tools._FormatMessage(message);
            console.warn("BJS - " + formattedMessage);

            var entry = "<div style='color:orange'>" + formattedMessage + "</div><br>";
            Tools._AddLogEntry(entry);
        }

        private static _ErrorDisabled(message: string): void {
            // nothing to do
        }
        private static _ErrorEnabled(message: string): void {
            Tools.errorsCount++;
            var formattedMessage = Tools._FormatMessage(message);
            console.error("BJS - " + formattedMessage);

            var entry = "<div style='color:red'>" + formattedMessage + "</div><br>";
            Tools._AddLogEntry(entry);
        }

        public static Log: (message: string) => void = Tools._LogEnabled;

        public static Warn: (message: string) => void = Tools._WarnEnabled;

        public static Error: (message: string) => void = Tools._ErrorEnabled;

        public static get LogCache(): string {
            return Tools._LogCache;
        }

        public static ClearLogCache(): void {
            Tools._LogCache = "";
            Tools.errorsCount = 0;
        }

        public static set LogLevels(level: number) {
            if ((level & Tools.MessageLogLevel) === Tools.MessageLogLevel) {
                Tools.Log = Tools._LogEnabled;
            }
            else {
                Tools.Log = Tools._LogDisabled;
            }

            if ((level & Tools.WarningLogLevel) === Tools.WarningLogLevel) {
                Tools.Warn = Tools._WarnEnabled;
            }
            else {
                Tools.Warn = Tools._WarnDisabled;
            }

            if ((level & Tools.ErrorLogLevel) === Tools.ErrorLogLevel) {
                Tools.Error = Tools._ErrorEnabled;
            }
            else {
                Tools.Error = Tools._ErrorDisabled;
            }
        }

        public static IsWindowObjectExist(): boolean {
            return (typeof window) !== "undefined";
        }

        // Performances
        private static _PerformanceNoneLogLevel = 0;
        private static _PerformanceUserMarkLogLevel = 1;
        private static _PerformanceConsoleLogLevel = 2;

        private static _performance: Performance;

        static get PerformanceNoneLogLevel(): number {
            return Tools._PerformanceNoneLogLevel;
        }

        static get PerformanceUserMarkLogLevel(): number {
            return Tools._PerformanceUserMarkLogLevel;
        }

        static get PerformanceConsoleLogLevel(): number {
            return Tools._PerformanceConsoleLogLevel;
        }

        public static set PerformanceLogLevel(level: number) {
            if ((level & Tools.PerformanceUserMarkLogLevel) === Tools.PerformanceUserMarkLogLevel) {
                Tools.StartPerformanceCounter = Tools._StartUserMark;
                Tools.EndPerformanceCounter = Tools._EndUserMark;
                return;
            }

            if ((level & Tools.PerformanceConsoleLogLevel) === Tools.PerformanceConsoleLogLevel) {
                Tools.StartPerformanceCounter = Tools._StartPerformanceConsole;
                Tools.EndPerformanceCounter = Tools._EndPerformanceConsole;
                return;
            }

            Tools.StartPerformanceCounter = Tools._StartPerformanceCounterDisabled;
            Tools.EndPerformanceCounter = Tools._EndPerformanceCounterDisabled;
        }

        static _StartPerformanceCounterDisabled(counterName: string, condition?: boolean): void {
        }

        static _EndPerformanceCounterDisabled(counterName: string, condition?: boolean): void {
        }

        static _StartUserMark(counterName: string, condition = true): void {
            if (!Tools._performance) {
                if (!Tools.IsWindowObjectExist()) {
                    return;
                }
                Tools._performance = window.performance;
            }

            if (!condition || !Tools._performance.mark) {
                return;
            }
            Tools._performance.mark(counterName + "-Begin");
        }

        static _EndUserMark(counterName: string, condition = true): void {
            if (!condition || !Tools._performance.mark) {
                return;
            }
            Tools._performance.mark(counterName + "-End");
            Tools._performance.measure(counterName, counterName + "-Begin", counterName + "-End");
        }

        static _StartPerformanceConsole(counterName: string, condition = true): void {
            if (!condition) {
                return;
            }

            Tools._StartUserMark(counterName, condition);

            if (console.time) {
                console.time(counterName);
            }
        }

        static _EndPerformanceConsole(counterName: string, condition = true): void {
            if (!condition) {
                return;
            }

            Tools._EndUserMark(counterName, condition);

            if (console.time) {
                console.timeEnd(counterName);
            }
        }

        public static StartPerformanceCounter: (counterName: string, condition?: boolean) => void = Tools._StartPerformanceCounterDisabled;
        public static EndPerformanceCounter: (counterName: string, condition?: boolean) => void = Tools._EndPerformanceCounterDisabled;

        public static get Now(): number {
            if (Tools.IsWindowObjectExist() && window.performance && window.performance.now) {
                return window.performance.now();
            }

            return new Date().getTime();
        }

        /**
         * This method will return the name of the class used to create the instance of the given object.
         * It will works only on Javascript basic data types (number, string, ...) and instance of class declared with the @className decorator.
         * @param object the object to get the class name from
         * @return the name of the class, will be "object" for a custom data type not using the @className decorator
         */
        public static GetClassName(object: any, isType: boolean = false): string {
            let name = null;

            if (!isType && object.getClassName) {
                name = object.getClassName();
            } else {
                if (object instanceof Object) {
                    let classObj = isType ? object : Object.getPrototypeOf(object);
                    name = classObj.constructor["__bjsclassName__"];
                }
                if (!name) {
                    name = typeof object;
                }
            }
            return name;
        }

        public static First<T>(array: Array<T>, predicate: (item: T) => boolean): Nullable<T> {
            for (let el of array) {
                if (predicate(el)) {
                    return el;
                }
            }

            return null;
        }

        /**
         * This method will return the name of the full name of the class, including its owning module (if any).
         * It will works only on Javascript basic data types (number, string, ...) and instance of class declared with the @className decorator or implementing a method getClassName():string (in which case the module won't be specified).
         * @param object the object to get the class name from
         * @return a string that can have two forms: "moduleName.className" if module was specified when the class' Name was registered or "className" if there was not module specified.
         */
        public static getFullClassName(object: any, isType: boolean = false): Nullable<string> {
            let className = null;
            let moduleName = null;

            if (!isType && object.getClassName) {
                className = object.getClassName();
            } else {
                if (object instanceof Object) {
                    let classObj = isType ? object : Object.getPrototypeOf(object);
                    className = classObj.constructor["__bjsclassName__"];
                    moduleName = classObj.constructor["__bjsmoduleName__"];
                }
                if (!className) {
                    className = typeof object;
                }
            }

            if (!className) {
                return null;
            }

            return ((moduleName != null) ? (moduleName + ".") : "") + className;
        }

        /**
         * This method can be used with hashCodeFromStream when your input is an array of values that are either: number, string, boolean or custom type implementing the getHashCode():number method.
         * @param array
         */
        public static arrayOrStringFeeder(array: any): (i: number) => number {
            return (index: number) => {
                if (index >= array.length) {
                    return null;
                }

                let val = array.charCodeAt ? array.charCodeAt(index) : array[index];
                if (val && val.getHashCode) {
                    val = val.getHashCode();
                }
                if (typeof val === "string") {
                    return Tools.hashCodeFromStream(Tools.arrayOrStringFeeder(val));
                }
                return val;
            };
        }

        /**
         * Compute the hashCode of a stream of number
         * To compute the HashCode on a string or an Array of data types implementing the getHashCode() method, use the arrayOrStringFeeder method.
         * @param feeder a callback that will be called until it returns null, each valid returned values will be used to compute the hash code.
         * @return the hash code computed
         */
        public static hashCodeFromStream(feeder: (index: number) => number): number {
            // Based from here: http://stackoverflow.com/a/7616484/802124
            let hash = 0;
            let index = 0;
            let chr = feeder(index++);
            while (chr != null) {
                hash = ((hash << 5) - hash) + chr;
                hash |= 0;                          // Convert to 32bit integer
                chr = feeder(index++);
            }
            return hash;
        }

        /**
         * Returns a promise that resolves after the given amount of time.
         * @param delay Number of milliseconds to delay
         * @returns Promise that resolves after the given amount of time
         */
        public static DelayAsync(delay: number): Promise<void> {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, delay);
            });
        }
    }

    /**
     * This class is used to track a performance counter which is number based.
     * The user has access to many properties which give statistics of different nature
     * 
     * The implementer can track two kinds of Performance Counter: time and count
     * For time you can optionally call fetchNewFrame() to notify the start of a new frame to monitor, then call beginMonitoring() to start and endMonitoring() to record the lapsed time. endMonitoring takes a newFrame parameter for you to specify if the monitored time should be set for a new frame or accumulated to the current frame being monitored.
     * For count you first have to call fetchNewFrame() to notify the start of a new frame to monitor, then call addCount() how many time required to increment the count value you monitor.
     */
    export class PerfCounter {
        public static Enabled = true;

        /**
         * Returns the smallest value ever
         */
        public get min(): number {
            return this._min;
        }

        /**
         * Returns the biggest value ever
         */
        public get max(): number {
            return this._max;
        }

        /**
         * Returns the average value since the performance counter is running
         */
        public get average(): number {
            return this._average;
        }

        /**
         * Returns the average value of the last second the counter was monitored
         */
        public get lastSecAverage(): number {
            return this._lastSecAverage;
        }

        /**
         * Returns the current value
         */
        public get current(): number {
            return this._current;
        }

        public get total(): number {
            return this._totalAccumulated;
        }

        public get count(): number {
            return this._totalValueCount;
        }

        constructor() {
            this._startMonitoringTime = 0;
            this._min = 0;
            this._max = 0;
            this._average = 0;
            this._lastSecAverage = 0;
            this._current = 0;
            this._totalValueCount = 0;
            this._totalAccumulated = 0;
            this._lastSecAccumulated = 0;
            this._lastSecTime = 0;
            this._lastSecValueCount = 0;
        }

        /**
         * Call this method to start monitoring a new frame.
         * This scenario is typically used when you accumulate monitoring time many times for a single frame, you call this method at the start of the frame, then beginMonitoring to start recording and endMonitoring(false) to accumulated the recorded time to the PerfCounter or addCount() to accumulate a monitored count.
         */
        public fetchNewFrame() {
            this._totalValueCount++;
            this._current = 0;
            this._lastSecValueCount++;
        }

        /**
         * Call this method to monitor a count of something (e.g. mesh drawn in viewport count)
         * @param newCount the count value to add to the monitored count
         * @param fetchResult true when it's the last time in the frame you add to the counter and you wish to update the statistics properties (min/max/average), false if you only want to update statistics.
         */
        public addCount(newCount: number, fetchResult: boolean) {
            if (!PerfCounter.Enabled) {
                return;
            }
            this._current += newCount;
            if (fetchResult) {
                this._fetchResult();
            }
        }

        /**
         * Start monitoring this performance counter
         */
        public beginMonitoring() {
            if (!PerfCounter.Enabled) {
                return;
            }
            this._startMonitoringTime = Tools.Now;
        }

        /**
         * Compute the time lapsed since the previous beginMonitoring() call.
         * @param newFrame true by default to fetch the result and monitor a new frame, if false the time monitored will be added to the current frame counter
         */
        public endMonitoring(newFrame: boolean = true) {
            if (!PerfCounter.Enabled) {
                return;
            }

            if (newFrame) {
                this.fetchNewFrame();
            }

            let currentTime = Tools.Now;
            this._current = currentTime - this._startMonitoringTime;

            if (newFrame) {
                this._fetchResult();
            }
        }

        private _fetchResult() {
            this._totalAccumulated += this._current;
            this._lastSecAccumulated += this._current;

            // Min/Max update
            this._min = Math.min(this._min, this._current);
            this._max = Math.max(this._max, this._current);
            this._average = this._totalAccumulated / this._totalValueCount;

            // Reset last sec?
            let now = Tools.Now;
            if ((now - this._lastSecTime) > 1000) {
                this._lastSecAverage = this._lastSecAccumulated / this._lastSecValueCount;
                this._lastSecTime = now;
                this._lastSecAccumulated = 0;
                this._lastSecValueCount = 0;
            }
        }

        private _startMonitoringTime: number;
        private _min: number;
        private _max: number;
        private _average: number;
        private _current: number;
        private _totalValueCount: number;
        private _totalAccumulated: number;
        private _lastSecAverage: number;
        private _lastSecAccumulated: number;
        private _lastSecTime: number;
        private _lastSecValueCount: number;
    }

    /**
     * Use this className as a decorator on a given class definition to add it a name and optionally its module.
     * You can then use the Tools.getClassName(obj) on an instance to retrieve its class name.
     * This method is the only way to get it done in all cases, even if the .js file declaring the class is minified
     * @param name The name of the class, case should be preserved
     * @param module The name of the Module hosting the class, optional, but strongly recommended to specify if possible. Case should be preserved.
     */
    export function className(name: string, module?: string): (target: Object) => void {
        return (target: Object) => {
            (<any>target)["__bjsclassName__"] = name;
            (<any>target)["__bjsmoduleName__"] = (module != null) ? module : null;
        }
    }

    /**
    * An implementation of a loop for asynchronous functions.
    */
    export class AsyncLoop {
        public index: number;
        private _done: boolean;

        /**
         * Constroctor.
         * @param iterations the number of iterations.
         * @param _fn the function to run each iteration
         * @param _successCallback the callback that will be called upon succesful execution
         * @param offset starting offset.
         */
        constructor(public iterations: number, private _fn: (asyncLoop: AsyncLoop) => void, private _successCallback: () => void, offset: number = 0) {
            this.index = offset - 1;
            this._done = false;
        }

        /**
         * Execute the next iteration. Must be called after the last iteration was finished.
         */
        public executeNext(): void {
            if (!this._done) {
                if (this.index + 1 < this.iterations) {
                    ++this.index;
                    this._fn(this);
                } else {
                    this.breakLoop();
                }
            }
        }

        /**
         * Break the loop and run the success callback.
         */
        public breakLoop(): void {
            this._done = true;
            this._successCallback();
        }

        /**
         * Helper function
         */
        public static Run(iterations: number, _fn: (asyncLoop: AsyncLoop) => void, _successCallback: () => void, offset: number = 0): AsyncLoop {
            var loop = new AsyncLoop(iterations, _fn, _successCallback, offset);

            loop.executeNext();

            return loop;
        }


        /**
         * A for-loop that will run a given number of iterations synchronous and the rest async.
         * @param iterations total number of iterations
         * @param syncedIterations number of synchronous iterations in each async iteration.
         * @param fn the function to call each iteration.
         * @param callback a success call back that will be called when iterating stops.
         * @param breakFunction a break condition (optional)
         * @param timeout timeout settings for the setTimeout function. default - 0.
         * @constructor
         */
        public static SyncAsyncForLoop(iterations: number, syncedIterations: number, fn: (iteration: number) => void, callback: () => void, breakFunction?: () => boolean, timeout: number = 0) {
            AsyncLoop.Run(Math.ceil(iterations / syncedIterations), (loop: AsyncLoop) => {
                if (breakFunction && breakFunction()) loop.breakLoop();
                else {
                    setTimeout(() => {
                        for (var i = 0; i < syncedIterations; ++i) {
                            var iteration = (loop.index * syncedIterations) + i;
                            if (iteration >= iterations) break;
                            fn(iteration);
                            if (breakFunction && breakFunction()) {
                                loop.breakLoop();
                                break;
                            }
                        }
                        loop.executeNext();
                    }, timeout);
                }
            }, callback);
        }
    }
} 
