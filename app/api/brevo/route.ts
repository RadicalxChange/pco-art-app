import { NextResponse } from "next/server";

const { BREVO_API_KEY, BREVO_LIST_ID } = process.env;

export async function POST(request: Request) {
  if (!BREVO_API_KEY) {
    return NextResponse.json(
      { error: "BREVO_API_KEY no está configurada en el servidor." },
      { status: 500 }
    );
  }

  try {
    const { email, name } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "El email es obligatorio." },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      email,
      attributes: {
        FIRSTNAME: typeof name === "string" ? name : "",
      },
    };

    if (BREVO_LIST_ID) {
      const parsedListId = Number(BREVO_LIST_ID);
      if (!Number.isNaN(parsedListId)) {
        payload.listIds = [parsedListId];
      }
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await brevoResponse.json().catch(() => ({}));

    if (brevoResponse.ok) {
      return NextResponse.json({ ok: true });
    }

    const errorMessage =
      responseBody?.message ??
      responseBody?.error ??
      "No se pudo registrar el contacto.";

    // Brevo devuelve 400 si el contacto ya existe.
    if (
      brevoResponse.status === 400 &&
      typeof errorMessage === "string" &&
      errorMessage.toLowerCase().includes("exist")
    ) {
      return NextResponse.json({ ok: true, duplicated: true });
    }

    return NextResponse.json(
      { error: errorMessage ?? "Error inesperado con Brevo." },
      { status: brevoResponse.status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado procesando la solicitud.",
      },
      { status: 500 }
    );
  }
}
