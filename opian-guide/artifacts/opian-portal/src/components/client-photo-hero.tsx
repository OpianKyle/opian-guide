import familyPhoto from "@assets/generated_images/myifa-protection-family.jpg";
import businessPhoto from "@assets/generated_images/myifa-business-planning.jpg";

type ClientPhotoHeroProps = {
  image: "family" | "business";
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
};

export default function ClientPhotoHero({
  image,
  eyebrow,
  title,
  description,
  className = "",
}: ClientPhotoHeroProps) {
  const photo = image === "family" ? familyPhoto : businessPhoto;
  const alt = image === "family"
    ? "A South African family meeting with a financial adviser to discuss protection."
    : "South African business owners reviewing their financial plans with an adviser.";

  return (
    <section className={`client-photo-hero ${className}`} aria-label={title}>
      <div className="client-photo-hero__image">
        <img src={photo} alt={alt} />
      </div>
      <div className="client-photo-hero__copy">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span>{description}</span>
      </div>
    </section>
  );
}
