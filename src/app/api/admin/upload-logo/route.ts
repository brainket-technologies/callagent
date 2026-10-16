import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
      "image/webp",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/gif",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|svg|webp|ico|gif)$/i)) {
      return NextResponse.json(
        { success: false, error: "Please upload a valid image file (.png, .svg, .jpg, .webp, .ico)" },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "logos");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const ext = path.extname(file.name) || ".png";
    const cleanBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);
    const uniqueFilename = `carrier-${cleanBase}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Save to disk
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/logos/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
