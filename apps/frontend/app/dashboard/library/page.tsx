import { Metadata } from "next"
import { getAuthedHonoClient } from "@/lib/api"
import { LibraryView } from "@/components/library/library-view"
import { Badge } from "@/components/ui/badge"
import type { License } from "@/types/extended"

export const metadata: Metadata = {
  title: "My Library | TailwindWizard",
  description: "Access and manage your acquired Tailwind CSS components.",
}

export default async function LibraryPage() {
  const authedClient = await getAuthedHonoClient()
  
  let licenses: License[] = []
  
  try {
    const res = await authedClient.api.v1.commerce.me.licenses.$get()
    if (res.ok) {
      const data = await res.json()
      // The API definition says LicenseList schema, but typically list endpoints return arrays
      // or objects containing arrays. Based on previous BuyerView assumption, it's an array.
      // If it's the LicenseList object from api.d.ts, we might need to adapt.
      licenses = (Array.isArray(data) ? data : [data]) as License[]
    }
  } catch (error) {
    console.error("Failed to fetch licenses:", error)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">My Library</Badge>
        </div>
        <h1 className="text-4xl font-bold font-heading tracking-tight">
          Your <span className="text-primary italic">Spellbook</span> 📖
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Everything you&apos;ve acquired in the marketplace. Download source code or use the CLI to add blocks directly to your project.
        </p>
      </div>

      <LibraryView initialLicenses={licenses} />
    </div>
  )
}
