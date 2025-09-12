import fs from "fs";
import path from "path";

export default function PublicTagPage({ params }) {
  const { slug } = params;

  // Load tags.json
  const filePath = path.join(process.cwd(), "data", "tags.json");
  let tags = [];
  try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    tags = JSON.parse(jsonData);
  } catch (err) {
    return <p className="p-4 text-red-500">Error loading tags.</p>;
  }

  // Find tag by slug
  const tag = tags.find((t) => t.slug === slug);

  if (!tag) {
    return <p className="p-4 text-red-500">Tag not found.</p>;
  }

  return (
    <div className="p-4 max-w-md mx-auto border rounded shadow-sm bg-gray-50">
      <h1 className="text-xl font-bold mb-2">Tag Info</h1>
      <p>
        <strong>Name:</strong> {tag.name || "-"}
      </p>
      <p>
        <strong>Phone 1:</strong> {tag.phone1 || "-"}
      </p>
      <p>
        <strong>Phone 2:</strong> {tag.phone2 || "-"}
      </p>
      <p>
        <strong>Address:</strong> {tag.address || "-"}
      </p>
    </div>
  );
}