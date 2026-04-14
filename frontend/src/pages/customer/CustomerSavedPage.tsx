import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { SavedServicesCollection } from '../../components/marketplace/SavedServicesCollection'

export function CustomerSavedPage() {
  return (
    <DashboardLayout
      title="Saved services"
      subtitle="Track the services you are considering before you place the next order."
    >
      <SavedServicesCollection />
    </DashboardLayout>
  )
}
