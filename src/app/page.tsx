import FileUpload06 from "@/components/file-upload-06";
import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-10 space-y-10">
      <Link href="/" className="text-2xl font-black block">
        PDF PULSE
      </Link>
      <FileUpload06 />
    </main>
  );
}
