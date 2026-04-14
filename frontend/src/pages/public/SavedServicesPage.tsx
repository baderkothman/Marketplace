import { SavedServicesCollection } from '../../components/marketplace/SavedServicesCollection'

export function SavedServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Saved services</h1>
        <p className="mt-1 text-sm text-text-muted">
          Keep a working shortlist of services and storefronts you want to revisit.
        </p>
      </div>

      <SavedServicesCollection />
    </div>
  )
}
