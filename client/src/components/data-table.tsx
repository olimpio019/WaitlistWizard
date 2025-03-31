import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Download, Trash2, ArrowUpDown, Search } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Submission } from "@shared/schema";
import { formatCPF, formatPhone, formatDate, getFormName } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataTable() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Submission>("dataCadastro");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const itemsPerPage = 10;

  const { data: submissions, isLoading, error } = useQuery<Submission[]>({
    queryKey: ['/api/submissions'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/submissions/${id}`),
    onSuccess: () => {
      toast({
        title: "Cadastro excluído",
        description: "O cadastro foi excluído com sucesso.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir cadastro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  // Handle sorting
  const handleSort = (field: keyof Submission) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort data
  const filteredData = submissions 
    ? submissions.filter(submission => 
        submission.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.codigoImovel.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          return sortDirection === "asc" 
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        }
        
        if (fieldA instanceof Date && fieldB instanceof Date) {
          return sortDirection === "asc" 
            ? fieldA.getTime() - fieldB.getTime()
            : fieldB.getTime() - fieldA.getTime();
        }
        
        // Default comparison for other types
        if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  // Calculate pagination
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData?.slice(startIndex, startIndex + itemsPerPage);

  // View submission details
  const handleView = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsViewModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteConfirm = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsDeleteDialogOpen(true);
  };

  // Download submission PDF
  const handleDownload = (id: number) => {
    window.open(`/api/submissions/${id}/pdf`, '_blank');
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (selectedSubmission) {
      deleteMutation.mutate(selectedSubmission.id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Lista de Cadastros</h2>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead>Cód. Imóvel</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-red-500">Erro ao carregar os dados: {error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Lista de Cadastros</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar cadastros..."
              className="pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("nome")}
                    className="flex items-center font-medium"
                  >
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("cpf")}
                    className="flex items-center font-medium"
                  >
                    CPF
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("email")}
                    className="flex items-center font-medium"
                  >
                    E-mail
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("celular")}
                    className="flex items-center font-medium"
                  >
                    Celular
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("codigoImovel")}
                    className="flex items-center font-medium"
                  >
                    Cód. Imóvel
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("dataCadastro")}
                    className="flex items-center font-medium"
                  >
                    Data de Cadastro
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium">{submission.nome}</TableCell>
                    <TableCell>{formatCPF(submission.cpf)}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{formatPhone(submission.celular)}</TableCell>
                    <TableCell>{submission.codigoImovel}</TableCell>
                    <TableCell>{formatDate(submission.dataCadastro)}</TableCell>
                    <TableCell className="space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleView(submission)} 
                        className="text-primary hover:text-primary-hover"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDownload(submission.id)} 
                        className="text-emerald-500 hover:text-emerald-600"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteConfirm(submission)} 
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    {searchTerm ? "Nenhum resultado encontrado" : "Nenhum cadastro disponível"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando <span className="font-medium">{startIndex + 1}</span> à <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredData.length)}</span> de <span className="font-medium">{filteredData.length}</span> resultados
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first page, last page, current page, and 1 page before and after current
                  const pageNumbers = new Set([1, totalPages]);
                  [-1, 0, 1].forEach(offset => {
                    const pageNumber = currentPage + offset;
                    if (pageNumber >= 1 && pageNumber <= totalPages) {
                      pageNumbers.add(pageNumber);
                    }
                  });
                  
                  const visiblePages = [...pageNumbers].sort((a, b) => a - b);
                  
                  return visiblePages.map((page, index) => {
                    // Add ellipsis if there's a gap
                    if (index > 0 && page - visiblePages[index - 1] > 1) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cadastro</DialogTitle>
            <DialogDescription>
              {selectedSubmission && getFormName(selectedSubmission.tipoFormulario)}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Nome</h4>
                <p className="text-sm mb-3">{selectedSubmission.nome}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">CPF/CNPJ</h4>
                <p className="text-sm mb-3">{formatCPF(selectedSubmission.cpf)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">E-mail</h4>
                <p className="text-sm mb-3">{selectedSubmission.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Celular</h4>
                <p className="text-sm mb-3">{formatPhone(selectedSubmission.celular)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Código do Imóvel</h4>
                <p className="text-sm mb-3">{selectedSubmission.codigoImovel}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Data de Cadastro</h4>
                <p className="text-sm mb-3">{formatDate(selectedSubmission.dataCadastro)}</p>
              </div>
              
              {selectedSubmission.assinatura && (
                <div className="col-span-2">
                  <h4 className="text-sm font-medium mb-1">Assinatura</h4>
                  <div className="border rounded p-2 mb-3">
                    <img 
                      src={selectedSubmission.assinatura} 
                      alt="Assinatura" 
                      className="max-h-32 mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Fechar</Button>
            {selectedSubmission && (
              <Button 
                variant="secondary"
                onClick={() => handleDownload(selectedSubmission.id)}
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cadastro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
