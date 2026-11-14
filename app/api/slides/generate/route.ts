import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generateLocalSlideDeck } from "@/lib/slides/generator";
import { PresentationDeck, SlideData, SlideThemeId, SLIDE_THEMES } from "@/lib/slides/types";

export const maxDuration = 60; // Next.js serverless execution timeout

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      topic = "Inovasi & Transformasi Digital",
      slideCount = 6,
      tone = "auto",
      theme: userTheme = "auto",
      targetAudience = "Peserta & Audiens",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API key is available, attempt real AI generation
    if (apiKey && apiKey !== "your-gemini-api-key") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const modelsToTry = [
          "gemini-3.5-flash-lite",
          "gemini-flash-lite-latest",
          "gemini-3.1-flash-lite",
          "gemini-3.5-flash",
        ];

        const prompt = `Anda adalah Koda Presentation Architect & Creative Art Director kelas dunia.
Tugas Anda: MERANCANG, MENDESAIN, DAN MENULIS materi presentasi (PPT) berkualitas tinggi secara cerdas, kontekstual, dan orisinal dari nol sesuai topik.

INSTRUKSI DESAIN:
- Topik: "${topic}"
- Jumlah Slide: ${slideCount} slide
- Gaya / Tone: ${tone}
- Target Audiens: "${targetAudience}"

1. TENTUKAN TEMA VISUAL (theme):
Pilih salah satu dari 5 tema berikut yang paling selaras dengan nuansa topik:
- "dark_cyber": Untuk topik pemrograman, coding, IT, teknologi, cybersecurity, web developer.
- "ocean_blue": Untuk topik data, cloud, analitik, perbankan, korporat terpercaya.
- "emerald": Untuk topik bisnis berkelanjutan, keuangan/fintech, kesehatan, operasional.
- "terracotta": Untuk startup inovatif, kreatif, desain, marketing, lifestyle.
- "minimal_light": Untuk materi akademik formal, riset, edukasi umum, laporan bersih.
(Catatan: Jika user meminta tema khusus "${userTheme}" selain "auto", utamakan "${userTheme}").

2. DESAIN KONTEN & ALUR CERITA (STORYLINE) SETIAP SLIDE:
PENTING: JANGAN gunakan template pitch deck generik jika topiknya tentang materi edukasi/coding/akademik!
Desain setiap slide agar mendalam, edukatif, dan kontekstual sesuai topik "${topic}".
Contoh jika topiknya "PHP Dasar":
- Slide 1 (title): Cover dengan judul tajam dan subjudul jelas
- Slide 2 (split): Konsep dasar & arsitektur server-side vs client-side
- Slide 3 (cards): Sintaks utama (Tag PHP, Variabel, Echo)
- Slide 4 (split/cards): Tipe data & manipulasi array
- Slide 5 (cards/timeline): Struktur kontrol (if-else, loops, foreach)
- Slide 6 (conclusion): Praktik, tips menulis kode bersih, dan langkah selanjutnya

3. PILIHAN LAYOUT PER SLIDE:
- "title": Cover presentasi.
- "split": 2 kolom (teks/bulletPoints di kiri, kartu highlight di kanan).
- "cards": 3-4 kartu pilar/fitur/konsep dengan "title", "description", dan "badge".
- "metrics": 3-4 kartu statistik/angka kunci dengan "value", "label", "detail", "change".
- "timeline": 3-4 tahapan alur/roadmap dengan "phase", "dateOrQuarter", "title", "description".
- "comparison": 3-4 baris perbandingan dengan "feature", "optionA", "optionB", "highlight": true.
- "quote": Kutipan inspiratif / suara tokoh dengan "quoteAuthor", "quoteRole", dan "bulletPoints".
- "conclusion": Kesimpulan penutup dengan "cards" (Call to Action) dan "footerText".

4. ATURAN OUTPUT JSON:
Hasilkan HANYA objek JSON murni (tanpa markdown backticks) dengan format:
{
  "title": "Judul Lengkap Presentasi",
  "description": "Deskripsi singkat presentasi",
  "theme": "pilihan_tema_sesuai_aturan_di_atas",
  "slides": [
    {
      "id": "slide-1",
      "layout": "title",
      "title": "Judul Slide 1",
      "subtitle": "Penjelasan pengantar...",
      "badge": "BADGE",
      "speakerNotes": "Catatan untuk presenter saat membawakan slide ini..."
    }
  ]
}`;

        for (const modelName of modelsToTry) {
          try {
            const result = await ai.models.generateContent({
              model: modelName,
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            });

            const textOutput = result.text || "";
            if (textOutput) {
              const cleanJson = textOutput.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
              const parsedData = JSON.parse(cleanJson);

              // Support BOTH formats: { slides: [...] } and direct array [ {...}, {...} ]
              let rawSlides: any[] = [];
              let generatedTheme: SlideThemeId = "terracotta";
              let deckTitle: string = topic;
              let deckDesc: string = `Presentasi mengenai ${topic}`;

              if (Array.isArray(parsedData)) {
                rawSlides = parsedData;
              } else if (parsedData && typeof parsedData === "object") {
                if (Array.isArray(parsedData.slides)) {
                  rawSlides = parsedData.slides;
                } else if (parsedData.deck && Array.isArray(parsedData.deck.slides)) {
                  rawSlides = parsedData.deck.slides;
                } else if (parsedData.presentation && Array.isArray(parsedData.presentation.slides)) {
                  rawSlides = parsedData.presentation.slides;
                }

                if (parsedData.title) deckTitle = parsedData.title;
                if (parsedData.description) deckDesc = parsedData.description;
                if (parsedData.theme && SLIDE_THEMES[parsedData.theme as SlideThemeId]) {
                  generatedTheme = parsedData.theme as SlideThemeId;
                }
              }

              // Auto-detect theme if userTheme is auto or not set
              if (userTheme && userTheme !== "auto" && SLIDE_THEMES[userTheme as SlideThemeId]) {
                generatedTheme = userTheme as SlideThemeId;
              } else if (!parsedData.theme) {
                // Auto-theme heuristic by topic keywords
                const lowerTopic = topic.toLowerCase();
                if (/php|code|coding|dev|script|python|java|html|css|sql|api|system|bug|tech/.test(lowerTopic)) {
                  generatedTheme = "dark_cyber";
                } else if (/finance|uang|bank|saham|invest|health|medis|sehat|green|lingkungan/.test(lowerTopic)) {
                  generatedTheme = "emerald";
                } else if (/data|cloud|analitik|keamanan|audit|server|network/.test(lowerTopic)) {
                  generatedTheme = "ocean_blue";
                } else if (/akademik|kuliah|sekolah|skripsi|jurnal|laporan/.test(lowerTopic)) {
                  generatedTheme = "minimal_light";
                } else {
                  generatedTheme = "terracotta";
                }
              }

              if (rawSlides.length > 0) {
                const now = new Date().toISOString();
                const deck: PresentationDeck = {
                  id: `deck-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  title: deckTitle,
                  description: deckDesc,
                  topic,
                  targetAudience,
                  theme: generatedTheme,
                  createdAt: now,
                  updatedAt: now,
                  slides: rawSlides.map((s: any, idx: number) => {
                    const slideId = s.id || `slide-${idx + 1}`;
                    const layout = (s.layout as any) || (idx === 0 ? "title" : "cards");

                    // Map bullets or items
                    let bulletPoints: string[] | undefined = undefined;
                    if (Array.isArray(s.bulletPoints)) {
                      bulletPoints = s.bulletPoints.map(String);
                    } else if (Array.isArray(s.bullets)) {
                      bulletPoints = s.bullets.map(String);
                    } else if (Array.isArray(s.items) && typeof s.items[0] === "string") {
                      bulletPoints = s.items.map(String);
                    } else if (Array.isArray(s.points)) {
                      bulletPoints = s.points.map(String);
                    }

                    // Map cards
                    let cards: any[] | undefined = undefined;
                    if (Array.isArray(s.cards)) {
                      cards = s.cards.map((c: any, cIdx: number) => ({
                        id: c.id || `c-${slideId}-${cIdx + 1}`,
                        title: c.title || `Poin ${cIdx + 1}`,
                        description: c.description || c.desc || "",
                        badge: c.badge || `0${cIdx + 1}`,
                      }));
                    } else if (Array.isArray(s.items) && typeof s.items[0] === "object" && s.items[0] !== null) {
                      cards = s.items.map((c: any, cIdx: number) => ({
                        id: c.id || `c-${slideId}-${cIdx + 1}`,
                        title: c.title || `Poin ${cIdx + 1}`,
                        description: c.description || c.desc || "",
                        badge: c.badge || `0${cIdx + 1}`,
                      }));
                    }

                    // Map metrics
                    let metrics: any[] | undefined = undefined;
                    if (Array.isArray(s.metrics)) {
                      metrics = s.metrics.map((m: any, mIdx: number) => ({
                        id: m.id || `m-${slideId}-${mIdx + 1}`,
                        value: m.value || m.val || "100%",
                        label: m.label || m.title || "Statistik",
                        detail: m.detail || m.description || "",
                        change: m.change || m.growth || "",
                      }));
                    } else if (Array.isArray(s.stats)) {
                      metrics = s.stats.map((m: any, mIdx: number) => ({
                        id: m.id || `m-${slideId}-${mIdx + 1}`,
                        value: m.value || "100%",
                        label: m.label || "Statistik",
                        detail: m.detail || "",
                        change: m.change || "",
                      }));
                    }

                    // Map timeline
                    let timeline: any[] | undefined = undefined;
                    if (Array.isArray(s.timeline)) {
                      timeline = s.timeline.map((t: any, tIdx: number) => ({
                        id: t.id || `t-${slideId}-${tIdx + 1}`,
                        phase: t.phase || `Fase ${tIdx + 1}`,
                        dateOrQuarter: t.dateOrQuarter || t.date || `Langkah ${tIdx + 1}`,
                        title: t.title || "Tahapan",
                        description: t.description || "",
                      }));
                    } else if (Array.isArray(s.steps)) {
                      timeline = s.steps.map((t: any, tIdx: number) => ({
                        id: t.id || `t-${slideId}-${tIdx + 1}`,
                        phase: t.phase || `Langkah ${tIdx + 1}`,
                        dateOrQuarter: t.dateOrQuarter || `Step ${tIdx + 1}`,
                        title: t.title || "Tahapan",
                        description: t.description || "",
                      }));
                    }

                    // Map comparison
                    let comparison: any[] | undefined = undefined;
                    if (Array.isArray(s.comparison)) {
                      comparison = s.comparison.map((cp: any, cpIdx: number) => ({
                        id: cp.id || `cp-${slideId}-${cpIdx + 1}`,
                        feature: cp.feature || cp.item || "Fitur",
                        optionA: cp.optionA || cp.solusiBaru || "Metode Baru",
                        optionB: cp.optionB || cp.solusiLama || "Metode Konvensional",
                        highlight: cp.highlight ?? true,
                      }));
                    }

                    // Default fillers if layout-specific fields are missing
                    if (layout === "split" && (!bulletPoints || bulletPoints.length === 0)) {
                      bulletPoints = [
                        `Prinsip penting dalam ${topic}.`,
                        `Implementasi terarah untuk audiens ${targetAudience}.`,
                        `Fondasi utama yang perlu dipahami secara mendalam.`,
                      ];
                    }

                    if (layout === "cards" && (!cards || cards.length === 0)) {
                      cards = [
                        { id: `c-${slideId}-1`, title: "Konsep Inti", description: `Pembahasan pilar awal mengenai ${topic}.`, badge: "Pilar 1" },
                        { id: `c-${slideId}-2`, title: "Penerapan Nyata", description: "Metodologi dan langkah kerja dalam praktik sehari-hari.", badge: "Pilar 2" },
                        { id: `c-${slideId}-3`, title: "Optimasi Lanjutan", description: "Peningkatan kualitas hasil dan penanganan kasus khusus.", badge: "Pilar 3" },
                      ];
                    }

                    if (layout === "metrics" && (!metrics || metrics.length === 0)) {
                      metrics = [
                        { id: `m-${slideId}-1`, value: "78%+", label: "Adopsi Industri", detail: "Dominasi penggunaan di ekosistem global", change: "+12%" },
                        { id: `m-${slideId}-2`, value: "3.5x", label: "Efisiensi Pengerjaan", detail: "Percepatan alur kerja dibanding metode lama", change: "+250%" },
                        { id: `m-${slideId}-3`, value: "100%", label: "Standar Praktik", detail: "Kesesuaian dengan kurikulum modern", change: "Stabil" },
                      ];
                    }

                    return {
                      id: slideId,
                      layout,
                      title: s.title || `Slide ${idx + 1}`,
                      subtitle: s.subtitle || "",
                      badge: s.badge || "KODA AI",
                      bulletPoints,
                      cards,
                      metrics,
                      timeline,
                      comparison,
                      quoteAuthor: s.quoteAuthor || (layout === "quote" ? "Pakar Bidang" : undefined),
                      quoteRole: s.quoteRole || (layout === "quote" ? "Spesialis Topik" : undefined),
                      footerText: s.footerText || `Koda AI Presentation Studio · ${new Date().getFullYear()}`,
                      speakerNotes: s.speakerNotes || "Sampaikan materi slide ini secara runtut dan fokus pada poin utama audiens.",
                    };
                  }),
                };

                return NextResponse.json({ success: true, deck, source: "gemini_ai" });
              }
            }
          } catch (modelErr: any) {
            console.warn(`[Slide Generator] Model ${modelName} error:`, modelErr?.message);
          }
        }
      } catch (geminiErr: any) {
        console.warn("[Slide Generator] Gemini SDK fallback:", geminiErr?.message);
      }
    }

    // 2. Intelligent Dynamic Generator Fallback
    const localDeck = generateLocalSlideDeck({
      topic,
      slideCount: Number(slideCount) || 6,
      tone: tone as any,
      theme: userTheme !== "auto" ? (userTheme as SlideThemeId) : undefined,
      targetAudience,
    });

    return NextResponse.json({ success: true, deck: localDeck, source: "local_engine" });
  } catch (error: any) {
    console.error("[Slide Generator API Fatal]:", error);
    const fallbackDeck = generateLocalSlideDeck({ topic: "Presentasi Koda AI" });
    return NextResponse.json({ success: true, deck: fallbackDeck, source: "fallback_rescue" });
  }
}
