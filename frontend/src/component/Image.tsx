import axios from "axios";
import { useEffect, useState } from "react";
import * as Spinners from "react-loader-spinner";

export function Image(): JSX.Element {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getImage = async () => {
      try {
        console.log("Fetching image...");
        const response = await axios.get("https://api.api-ninjas.com/v1/randomimage?category=nature", {
          responseType: 'blob',
          headers: { 'X-Api-Key': 'hHZkpfeXRrr+9UGnmkpFvg==oxn7i0t9DbAGsW9c' }
        });
        console.log("Response received:", response.status);
        
        
        if (response.status === 200) {
          const url = URL.createObjectURL(response.data);
          console.log("Image URL created:", url);
          setImageUrl(url);
        } else {
          throw new Error("Failed to fetch image");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Spinners.Oval
          visible={true}
          height={50}
          width={50}
          color="#000000"
          secondaryColor="#000000"
          strokeWidth={3}
          strokeWidthSecondary={4}
          ariaLabel="oval-loading"
        />
      </div>
    );
  }

  return imageUrl ? (
    <img src={imageUrl} alt="Random Nature" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  ) : (
    <div>Failed to load image</div>
  );
}