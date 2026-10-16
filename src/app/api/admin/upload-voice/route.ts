import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate audio mime type / extension
    const validAudioExtensions = /\.(mp3|wav|ogg|m4a|aac|webm)$/i;
    const isAudioType = file.type.startsWith("audio/") || validAudioExtensions.test(file.name);

    if (!isAudioType) {
      return NextResponse.json(
        { success: false, error: "Please upload a valid audio file (.mp3, .wav, .m4a, .ogg, .webm)" },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Audio file size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "voices");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const ext = path.extname(file.name) || ".mp3";
    const cleanBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);
    const uniqueFilename = `voice-${cleanBase}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Save to disk
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/voices/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
    });
  } catch (error: any) {
    console.error("Voice audio upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload voice audio" },
      { status: 500 }
    );
  }
}
