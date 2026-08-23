import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import {
  createGlobalProduct,
  getGlobalProduct,
  getOfficeProductContext,
  officeProductContexts,
  searchProducts,
  upsertOfficeProductContext,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { formatBrl } from '../../office/period';

type Ctx = { officeId: string };

export const ProductsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [tab, setTab] = useState<'catalog' | 'office'>('catalog');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  const catalogResults = useMemo(() => searchProducts(query, 30), [query]);
  const contexts = officeProductContexts(officeId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0B1E36]">Produtos</h1>
        <div className="flex gap-2">
          <Button size="sm" variant={tab === 'catalog' ? 'primary' : 'secondary'} onClick={() => setTab('catalog')}>
            Catálogo
          </Button>
          <Button size="sm" variant={tab === 'office' ? 'primary' : 'secondary'} onClick={() => setTab('office')}>
            Oficina
          </Button>
        </div>
      </div>

      {tab === 'catalog' && (
        <>
          <Input
            id="prd-search"
            label="Buscar no catálogo global"
            placeholder="Buscar produto, marca ou código..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={() => setCreateOpen(true)}>Cadastrar produto global</Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {['Nome', 'Marca', 'Código', 'Categoria'].map((h) => (
                    <th key={h} className="p-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catalogResults.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.brand}</td>
                    <td className="p-3 font-mono">{item.code}</td>
                    <td className="p-3">{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Alert tone="info">
            Antes de cadastrar, busque no catálogo global para reutilizar produtos já registrados no VEBOOK.
          </Alert>
        </>
      )}

      {tab === 'office' && (
        <>
          <p className="text-sm text-slate-600">
            Custos, preços, fornecedor e estoque são privados desta oficina. Dados financeiros de outras oficinas não são editáveis.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {['Produto', 'Custo', 'Preço', 'Fornecedor', 'Estoque', ''].map((h) => (
                    <th key={h || 'actions'} className="p-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contexts.map((ctx) => {
                  const product = getGlobalProduct(ctx.productId);
                  return (
                    <tr key={ctx.id}>
                      <td className="p-3">{product ? `${product.name} · ${product.brand}` : ctx.productId}</td>
                      <td className="p-3">{ctx.defaultCost != null ? formatBrl(ctx.defaultCost) : '—'}</td>
                      <td className="p-3">{ctx.defaultPrice != null ? formatBrl(ctx.defaultPrice) : '—'}</td>
                      <td className="p-3">{ctx.supplier ?? '—'}</td>
                      <td className="p-3">{ctx.stockQty ?? '—'}</td>
                      <td className="p-3">
                        <Button size="sm" variant="secondary" onClick={() => setEditProductId(ctx.productId)}>Editar</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button variant="secondary" onClick={() => setEditProductId('new')}>Vincular produto à oficina</Button>
        </>
      )}

      {createOpen && <CreateGlobalProductModal onClose={() => setCreateOpen(false)} />}
      {editProductId && (
        <OfficeProductModal
          officeId={officeId}
          productId={editProductId === 'new' ? undefined : editProductId}
          onClose={() => setEditProductId(null)}
        />
      )}
    </div>
  );
};

const CreateGlobalProductModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [application, setApplication] = useState('');
  const [duplicates, setDuplicates] = useState<Array<{ id: string; name: string; brand: string; code: string }>>([]);
  const [saved, setSaved] = useState(false);

  const submit = (force = false) => {
    const result = createGlobalProduct({ name, brand, code, category, application: application || undefined });
    if (result.duplicates.length && !force) {
      setDuplicates(result.duplicates);
      return;
    }
    setSaved(true);
    setDuplicates([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-[#0B1E36]">Cadastrar produto global</h2>
        <div className="mt-4 grid gap-3">
          <Input id="pg-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input id="pg-brand" label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} />
          <Input id="pg-code" label="Código" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input id="pg-cat" label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input id="pg-app" label="Aplicação" value={application} onChange={(e) => setApplication(e.target.value)} />
        </div>
        {duplicates.length > 0 && (
          <Alert tone="warning" title="Possíveis duplicatas" className="mt-4">
            <ul className="mt-2 list-disc pl-5">
              {duplicates.map((d) => (
                <li key={d.id}>{d.name} · {d.brand} · {d.code}</li>
              ))}
            </ul>
            <Button size="sm" className="mt-3" variant="secondary" onClick={() => submit(true)}>
              Usar existente / continuar mesmo assim
            </Button>
          </Alert>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => submit()}>Salvar</Button>
        </div>
        {saved && <p className="mt-2 text-sm text-emerald-700">Produto salvo.</p>}
      </div>
    </div>
  );
};

const OfficeProductModal: React.FC<{ officeId: string; productId?: string; onClose: () => void }> = ({ officeId, productId, onClose }) => {
  const existing = productId ? getOfficeProductContext(officeId, productId) : undefined;
  const [selectedProductId, setSelectedProductId] = useState(productId ?? '');
  const [search, setSearch] = useState('');
  const [cost, setCost] = useState(existing?.defaultCost != null ? String(existing.defaultCost) : '');
  const [price, setPrice] = useState(existing?.defaultPrice != null ? String(existing.defaultPrice) : '');
  const [supplier, setSupplier] = useState(existing?.supplier ?? '');
  const [stock, setStock] = useState(existing?.stockQty != null ? String(existing.stockQty) : '');
  const results = useMemo(() => searchProducts(search, 10), [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-[#0B1E36]">{existing ? 'Editar contexto da oficina' : 'Vincular produto'}</h2>
        {!productId && (
          <>
            <Input id="opc-search" label="Buscar produto" value={search} onChange={(e) => setSearch(e.target.value)} />
            <ul className="mt-2 max-h-32 overflow-y-auto rounded-lg border text-sm">
              {results.map((p) => (
                <li key={p.id}>
                  <button type="button" className="w-full px-3 py-2 text-left hover:bg-slate-50" onClick={() => setSelectedProductId(p.id)}>
                    {p.name} · {p.brand}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input id="opc-cost" label="Custo padrão" value={cost} onChange={(e) => setCost(e.target.value)} />
          <Input id="opc-price" label="Preço padrão" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input id="opc-sup" label="Fornecedor" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          <Input id="opc-stock" label="Estoque" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => {
            if (!selectedProductId) return;
            upsertOfficeProductContext(officeId, {
              id: existing?.id,
              productId: selectedProductId,
              defaultCost: cost ? Number(cost) : undefined,
              defaultPrice: price ? Number(price) : undefined,
              supplier: supplier || undefined,
              stockQty: stock ? Number(stock) : undefined,
            });
            onClose();
          }}>Salvar</Button>
        </div>
      </div>
    </div>
  );
};
