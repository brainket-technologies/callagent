import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiVoices, systemLanguages, systemTones } from "@/db/schema";
import { promises as fs } from "fs";
import path from "path";
import {
  getVoiceProvidersConfig,
  cloneVoiceWithElevenLabs,
} from "@/lib/voice-providers";
import { logWorkspaceActivity } from "@/lib/workspace-logs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string)?.trim() || "Custom Cloned Voice";
    const gender = (formData.get("gender") as string)?.toLowerCase().trim() || "female";
    const provider = (formData.get("provider") as string) || "ElevenLabs";
    const description = (formData.get("description") as string)?.trim() || "Custom Voice cloned from reference audio";
    const toneKey = (formData.get("tone") as string)?.trim() || "";
    const languagesRaw = formData.get("languages") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Please upload a reference audio file (.mp3, .wav) to replicate voice." },
        { status: 400 }
      );
    }

    // Validate audio file
    const validAudioExtensions = /\.(mp3|wav|ogg|m4a|aac|webm)$/i;
    const isAudioType = file.type.startsWith("audio/") || validAudioExtensions.test(file.name);
    if (!isAudioType) {
      return NextResponse.json(
        { success: false, error: "Please upload a valid reference audio file (.mp3, .wav, .m4a)." },
        { status: 400 }
      );
    }

    // Save Reference Audio File Locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const clonesDir = path.join(process.cwd(), "public", "uploads", "voices", "clones");
    await fs.mkdir(clonesDir, { recursive: true });

    const ext = path.extname(file.name) || ".mp3";
    const cleanBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    const uniqueFilename = `clone-${cleanBase}-${Date.now()}${ext}`;
    const filePath = path.join(clonesDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);
    const publicAudioUrl = `/uploads/voices/clones/${uniqueFilename}`;

    // Generate unique slug
    const slug = `custom-${cleanBase}-${Math.random().toString(36).substring(2, 7)}`;

    // Resolve Tone UUID
    const allTones = await db.select().from(systemTones);
    const matchedTone = toneKey
      ? allTones.find((t) => t.id === toneKey || t.key.toLowerCase() === toneKey.toLowerCase())
      : allTones[0];
    const resolvedToneId = matchedTone?.id || allTones[0]?.id || null;

    // Resolve Languages UUIDs
    let parsedLanguages: string[] = [];
    if (languagesRaw) {
      try {
        parsedLanguages = JSON.parse(languagesRaw);
      } catch {
        parsedLanguages = [languagesRaw];
      }
    }
    const allLangs = await db.select().from(systemLanguages);
    let resolvedLangIds: string[] = [];
    if (parsedLanguages.length > 0) {
      resolvedLangIds = parsedLanguages
        .map((target) => {
          const l = allLangs.find(
            (item) => item.id === target || item.code.toLowerCase() === target.toLowerCase()
          );
          return l?.id;
        })
        .filter(Boolean) as string[];
    }
    if (resolvedLangIds.length === 0 && allLangs.length > 0) {
      const defaultLang = allLangs.find((l) => l.code === "hi-IN") || allLangs[0];
      resolvedLangIds = [defaultLang.id];
    }

    // Replicate / Clone Voice using ElevenLabs if API Key is configured
    const providerConfig = await getVoiceProvidersConfig();
    let externalVoiceId = `clone-${Date.now()}`;
    let isClonedWithProvider = false;

    if (providerConfig.elevenlabsApiKey && (provider.toLowerCase() === "elevenlabs" || provider.toLowerCase() === "custom")) {
      const cloneResult = await cloneVoiceWithElevenLabs({
        apiKey: providerConfig.elevenlabsApiKey,
        name: `${name} (Custom Clone)`,
        audioFilePath: filePath,
        description: `Custom cloned voice created via Voxera AI Admin: ${description}`,
      });

      if (cloneResult?.voiceId) {
        externalVoiceId = cloneResult.voiceId;
        isClonedWithProvider = true;
      }
    }

    // Insert into PostgreSQL ai_voices table
    const [newVoice] = await db
      .insert(aiVoices)
      .values({
        slug,
        name: `${name} (Clone)`,
        provider: isClonedWithProvider ? "ElevenLabs" : (provider || "Custom"),
        voiceId: externalVoiceId,
        model: isClonedWithProvider ? "Instant Voice Clone" : "Reference Audio Clone",
        tag: "Custom Clone",
        gender,
        languages: resolvedLangIds,
        tone: resolvedToneId,
        previewAudioUrl: publicAudioUrl,
        description: isClonedWithProvider
          ? `Instant neural clone replicated directly from reference audio using ElevenLabs. ${description}`
          : `Custom reference audio voice. ${description}`,
        isEnabled: true,
        sortOrder: 0,
      })
      .returning();

    // Log workspace activity
    await logWorkspaceActivity({
      workspaceId: "cfa1745d-1197-4c94-a38e-3c9c0fe0239c",
      userId: "admin-actor",
      userEmail: "admin@voxera.ai",
      operation: "Cloned custom voice from reference audio",
      resource: newVoice.name,
      resourceId: newVoice.id,
      resourceType: "agent",
      details: {
        slug: newVoice.slug,
        provider: newVoice.provider,
        externalVoiceId,
        isClonedWithProvider,
        referenceAudio: publicAudioUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: isClonedWithProvider
        ? "Voice successfully cloned with ElevenLabs and added to your voice library!"
        : "Custom reference audio voice saved and ready in your voice library!",
      voice: newVoice,
      isClonedWithProvider,
    });
  } catch (err: any) {
    console.error("POST /api/admin/voices/clone error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to clone voice from reference audio" },
      { status: 500 }
    );
  }
}
