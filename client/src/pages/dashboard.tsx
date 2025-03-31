import { Link } from "wouter";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardStats from "@/components/dashboard-stats";
import DataTable from "@/components/data-table";

export default function Dashboard() {
  return (
    <div id="dashboard-view">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cadastros</h1>
        <div className="flex space-x-3">
          <Link href="/forms/ficha-fiador-pf">
            <Button className="inline-flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              Novo Cadastro
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Data Table */}
      <DataTable />
    </div>
  );
}
