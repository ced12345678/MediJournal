"use client";

import { DataViewer } from "@/components/hospital-sharing";
import { ThemeProvider } from "@/components/theme-provider";

export default function ViewPage({ params }: { params: { data: string } }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <main>
                <DataViewer compressedData={params.data} />
            </main>
        </ThemeProvider>
    );
}
