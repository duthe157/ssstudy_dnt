import Image from "next/image";
import Link from "next/link";

interface NewsCardProps {
  id: string;
  title: string;
  date: string;
  image: string;
  alias: string;
  featured?: boolean;
  big?: boolean;
  category_alias: string;
}

export default function NewsCard({ title, date, image, alias, category_alias, big }: NewsCardProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden ${big ? "h-75" : "h-48"}`}>
      <Link href={`${category_alias}/${alias}`} target="_blank" rel="noopener noreferrer">

        <img src={image || 'https://w.ladicdn.com/5e5bae5298a7e87bbed7582a/the-gioi-moi-20240328122107-onzj7.png'} alt={title} className="object-cover w-full h-full" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center gap-1 text-sm text-gray-200 mb-1">
            <img
              src="/imgs/tin-tuc/date-time-white.svg"
              alt="Ngày đăng"
              className="w-4 h-4 object-contain"
            />
            <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
          </div>

          <h2 className="text-white font-semibold text-sm md:text-base">{title}</h2>
        </div>

      </Link>
    </div>
  );
}
