import AdminLayout from "@/components/admin/AdminLayout";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "GoCart. - Admin",
  description: "GoCart. - Admin",
};

export default function RootAdminLayout({ children }) {
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  );
}
