import { getMyMedicationsAction } from "@/server/modules/inventory/features/medications/actions/my-medications.actions";
import { NextResponse } from "next/server";

export async function GET() {
    const result = await getMyMedicationsAction();
    return NextResponse.json(result);
}
