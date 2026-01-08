
import { GoogleGenAI, Type } from "@google/genai";
import { CurriculumContext, TP, ATP, ProtaItem, PromesItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTPFromCP = async (cpText: string, context: CurriculumContext): Promise<TP[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analisis Capaian Pembelajaran (CP) berikut untuk ${context.subject} Fase ${context.phase}. 
    CP: "${cpText}"
    
    Tujuan: Buat Tujuan Pembelajaran (TP) yang measurable, berorientasi Deep Learning, dan menggunakan Taksonomi Bloom (Revisi).
    Satu CP harus menghasilkan setidaknya 3-5 TP yang mendalam.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            cpId: { type: Type.STRING },
            statement: { type: Type.STRING, description: "Pernyataan TP formal dalam Bahasa Indonesia" },
            competency: { type: Type.STRING, description: "Kompetensi yang disasar" },
            content: { type: Type.STRING, description: "Materi inti" },
            bloomLevel: { type: Type.STRING, description: "Level Taksonomi Bloom (misal: C4 - Analisis)" },
          },
          required: ["id", "cpId", "statement", "competency", "content", "bloomLevel"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateATPFromTPs = async (tps: TP[], context: CurriculumContext): Promise<ATP[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Buat Alur Tujuan Pembelajaran (ATP) berdasarkan TP berikut: ${JSON.stringify(tps)}.
    Konteks: ${context.subject}, ${context.level} ${context.phase}.
    Pastikan urutan logis dari pemahaman dasar ke refleksi dan kreasi mendalam (Deep Learning). 
    Sertakan elemen Profil Pelajar Pancasila (P3).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            tpId: { type: Type.STRING },
            sequence: { type: Type.NUMBER },
            moduleName: { type: Type.STRING, description: "Nama Unit/Modul" },
            durationJP: { type: Type.NUMBER, description: "Jam Pelajaran" },
            p3Elements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["id", "tpId", "sequence", "moduleName", "durationJP", "p3Elements"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateProta = async (atps: ATP[], tps: TP[], context: CurriculumContext): Promise<ProtaItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Buat Program Tahunan (Prota) berdasarkan ATP: ${JSON.stringify(atps)} dan TP: ${JSON.stringify(tps)}.
    Total minggu efektif: ${context.effectiveWeeks}. Jam per minggu: ${context.jpPerWeek}.
    Total JP tersedia: ${context.effectiveWeeks * context.jpPerWeek}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            no: { type: Type.NUMBER },
            cp: { type: Type.STRING },
            atp: { type: Type.STRING },
            learningMaterial: { type: Type.STRING },
            totalJP: { type: Type.NUMBER },
            assessmentType: { type: Type.STRING },
          },
          required: ["no", "cp", "atp", "learningMaterial", "totalJP", "assessmentType"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generatePromes = async (prota: ProtaItem[], context: CurriculumContext): Promise<PromesItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Bagi Program Tahunan ini menjadi Program Semester 1 dan 2. 
    Konteks: ${context.subject}, Tahun Ajaran ${context.academicYear}.
    Data Prota: ${JSON.stringify(prota)}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            no: { type: Type.NUMBER },
            semester: { type: Type.NUMBER },
            cp: { type: Type.STRING },
            atp: { type: Type.STRING },
            learningMaterial: { type: Type.STRING },
            jp: { type: Type.NUMBER },
            assessmentForm: { type: Type.STRING },
          },
          required: ["no", "semester", "cp", "atp", "learningMaterial", "jp", "assessmentForm"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};
