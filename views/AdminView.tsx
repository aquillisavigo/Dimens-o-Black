
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'requests' | 'balance'>('products');
    const [products, setProducts] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Form State for Products
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('clonagem');
    const [imageUrl, setImageUrl] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');

    // State for Balance Management
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        { id: 'clonagem', name: 'Ofertas Clonadas' },
        { id: 'temas', name: 'Temas Shopify' },
        { id: 'kl-remotas', name: 'KL Remotas' },
        { id: 'spotify', name: 'Contas Spotify' }
    ];

    useEffect(() => {
        if (activeTab === 'products') {
            fetchProducts();
        } else if (activeTab === 'requests') {
            fetchRequests();
        } else if (activeTab === 'balance') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
    };

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('cloning_requests')
                .select('*, profiles!cloning_requests_user_id_fkey(full_name)')
                .order('created_at', { ascending: false });

            if (error) {
                // Fallback
                const { data: rawData } = await supabase.from('cloning_requests').select('*');
                if (rawData) setRequests(rawData);
            } else if (data) {
                setRequests(data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const fetchUsers = async () => {
        const { data, error } = await supabase.rpc('get_all_users_admin');
        if (error) {
            console.error('Error fetching users:', error);
            // Fallback: try to fetch profiles directly if RPC fails
            const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
            if (profiles) {
                setUsers(profiles.map(p => ({ ...p, email: 'Email Oculto (RPC Error)' })));
            } else {
                alert('Erro ao buscar usuários: ' + error.message);
            }
        } else if (data) {
            setUsers(data);
        }
    };

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const productData = {
            name,
            description,
            price,
            category,
            image_url: imageUrl,
            download_url: downloadUrl
        };

        let err;
        if (editingProduct) {
            const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
            err = error;
        } else {
            const { error } = await supabase.from('products').insert([productData]);
            err = error;
        }

        if (!err) {
            resetProductForm();
            fetchProducts();
            alert('Produto salvo com sucesso!');
        } else {
            alert('Erro ao salvar: ' + err.message);
        }
        setLoading(false);
    };

    const resetProductForm = () => {
        setEditingProduct(null);
        setName('');
        setDescription('');
        setPrice(0);
        setCategory('clonagem');
        setImageUrl('');
        setDownloadUrl('');
    };

    const handleUpdateRequestStatus = async (id: string, status: string) => {
        const request = requests.find(r => r.id === id);
        if (!request) return;

        const { error } = await supabase.from('cloning_requests').update({ status }).eq('id', id);

        if (!error) {
            let title = 'Atualização de Pedido';
            let message = `O status do seu pedido para "${request.project_name}" foi atualizado.`;
            let type = 'info';

            if (status === 'in_progress') {
                title = 'Clonagem Iniciada';
                message = `Iniciamos a clonagem do projeto "${request.project_name}".`;
            } else if (status === 'completed') {
                title = 'Clonagem Concluída!';
                message = `Seu projeto "${request.project_name}" está pronto e foi entregue.`;
                type = 'success';
            }

            await supabase.from('notifications').insert([{
                user_id: request.user_id,
                title,
                message,
                type
            }]);

            fetchRequests();
        }
    };

    const handleDeleteRequest = async (id: string) => {
        if (window.confirm('Excluir esta solicitação permanentemente?')) {
            const { error } = await supabase.from('cloning_requests').delete().eq('id', id);
            if (!error) fetchRequests();
            else alert('Erro ao excluir: ' + error.message);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Excluir este produto permanentemente?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) fetchProducts();
        }
    };

    const handleManualRecharge = async (userId: string, amountInput: number) => {
        setLoading(true);
        try {
            console.log(`Starting recharge for ${userId} amount: ${amountInput}`);
            const amount = parseFloat(amountInput.toString());

            if (isNaN(amount) || amount <= 0) {
                alert('Valor inválido.');
                setLoading(false);
                return;
            }

            // 1. Fetch current balance directly using ID
            const { data: userProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('balance, full_name') // Fetch name for nicer alert
                .eq('id', userId)
                .single();

            if (fetchError || !userProfile) {
                console.error('Fetch error:', fetchError);
                throw new Error('Usuário não encontrado pelo ID ou erro de rede.');
            }

            const currentBalance = parseFloat(userProfile.balance || '0');
            const newBalance = currentBalance + amount;

            console.log(`Current: ${currentBalance}, New: ${newBalance}`);

            // 2. Update balance
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', userId);

            if (updateError) {
                console.error('Update error:', updateError);
                throw updateError;
            }

            // 3. Notify user
            await supabase.from('notifications').insert([{
                user_id: userId,
                title: 'Recarga Recebida',
                message: `Você recebeu uma recarga de ${amount.toFixed(2)} DC da administração!`,
                type: 'success'
            }]);

            // 4. Force refresh of the list BEFORE alerting
            if (activeTab === 'balance') {
                await fetchUsers(); // Await ensures state is updated
            }

            alert(`Sucesso! Novo saldo para ${userProfile.full_name || 'Usuário'}: ${newBalance.toFixed(2)} DC`);

        } catch (err: any) {
            console.error('Recharge flow failed:', err);
            alert('Erro: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="header-admin bg-gradient-to-r from-red-950/40 to-black p-10 rounded-[2.5rem] border border-red-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">
                        Central do <span className="text-primary text-glow">Administrador</span>
                    </h2>
                    <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.3em] mt-2">Gestão de Inventário e Solicitações</p>
                </div>

                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                    <button onClick={() => setActiveTab('products')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-glow' : 'text-gray-500 hover:text-white'}`}>Produtos</button>
                    <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'requests' ? 'bg-primary text-white shadow-glow' : 'text-gray-500 hover:text-white'}`}>
                        Solicitações
                        {requests.filter(r => r.status === 'pending').length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>}
                    </button>
                    <button onClick={() => setActiveTab('balance')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-primary text-white shadow-glow' : 'text-gray-500 hover:text-white'}`}>Gestão de Saldo</button>
                </div>
            </div>

            {/* Content Switch */}
            {activeTab === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-surface-dark/50 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-xl">
                        <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">add_circle</span>
                            {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                        </h3>
                        <form onSubmit={handleSubmitProduct} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Título</label>
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Categoria</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Descrição</label>
                                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Preço (DC)</label>
                                    <input type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">URL Imagem</label>
                                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Link Download (.RAR)</label>
                                <input type="text" required value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] shadow-glow transition-all">{loading ? 'Salvando...' : 'Salvar Produto'}</button>
                                {editingProduct && <button type="button" onClick={resetProductForm} className="px-6 bg-white/5 rounded-xl text-white text-[10px] font-bold uppercase">Cancelar</button>}
                            </div>
                        </form>
                    </div>
                    <div className="bg-surface-dark/50 border border-white/5 p-10 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col">
                        <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">inventory_2</span>
                            Estoque Ativo ({products.length})
                        </h3>
                        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            {products.map(p => (
                                <div key={p.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4 group">
                                    <img src={p.image_url || 'https://via.placeholder.com/100'} className="w-14 h-14 rounded-xl object-cover" />
                                    <div className="flex-1">
                                        <div className="text-[7px] font-bold text-primary uppercase mb-1">{p.category}</div>
                                        <h4 className="text-white font-bold text-sm truncate max-w-[150px]">{p.name}</h4>
                                        <p className="text-green-500 font-bold text-[10px]">{p.price} DC</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingProduct(p); setName(p.name); setDescription(p.description); setPrice(p.price); setCategory(p.category); setImageUrl(p.image_url); setDownloadUrl(p.download_url); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/20"><span className="material-symbols-outlined text-sm">edit</span></button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="bg-surface-dark/50 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-xl overflow-hidden">
                    <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Fila de Clonagem ({requests.length})
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="pb-6 px-4">Operador</th>
                                    <th className="pb-6 px-4">Projeto / Link</th>
                                    <th className="pb-6 px-4">Contato</th>
                                    <th className="pb-6 px-4">Status</th>
                                    <th className="pb-6 px-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {requests.map(req => (
                                    <tr key={req.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-6 px-4">
                                            <div className="text-white font-bold text-sm">{req.profiles?.full_name || 'Desconhecido'}</div>
                                        </td>
                                        <td className="py-6 px-4 max-w-xs">
                                            <div className="text-white font-bold text-xs uppercase">{req.project_name}</div>
                                            <a href={req.original_link} target="_blank" rel="noreferrer" className="text-primary text-[10px] hover:underline truncate block">{req.original_link}</a>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold inline-block border border-indigo-500/20">{req.contact_info}</div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <select value={req.status} onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value)} className={`bg-black/40 border rounded-lg px-3 py-1 text-[9px] font-bold uppercase outline-none ${req.status === 'pending' ? 'text-yellow-500 border-yellow-500/20' : req.status === 'in_progress' ? 'text-blue-500 border-blue-500/20' : 'text-green-500 border-green-500/20'}`}>
                                                <option value="pending">Pendente</option>
                                                <option value="in_progress">Em Andamento</option>
                                                <option value="completed">Concluído</option>
                                            </select>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => alert(`Obs: ${req.observations || 'Sem observações'}`)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" title="Ver Observações"><span className="material-symbols-outlined text-sm">visibility</span></button>
                                                <button onClick={() => handleDeleteRequest(req.id)} className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors" title="Excluir"><span className="material-symbols-outlined text-sm">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {requests.length === 0 && <div className="text-center py-20 text-gray-600 text-[10px] uppercase font-bold tracking-widest">Nenhuma solicitação encontrada</div>}
                    </div>
                </div>
            )}

            {activeTab === 'balance' && (
                <div className="bg-surface-dark/50 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-xl">
                    <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">groups</span>
                        Gerenciar Usuários e Saldos
                    </h3>

                    <div className="mb-6 relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-primary outline-none"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="pb-6 px-4">Usuário</th>
                                    <th className="pb-6 px-4">Email</th>
                                    <th className="pb-6 px-4">Saldo Atual</th>
                                    <th className="pb-6 px-4">Ação Rápida</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.filter(u =>
                                    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(u => (
                                    <tr key={u.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-6 px-4">
                                            <div className="text-white font-bold text-sm">{u.full_name || 'Sem nome'}</div>
                                            <div className="text-[9px] text-gray-500 uppercase">ID: {u.id.slice(0, 8)}...</div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="text-gray-300 text-xs font-mono">{u.email}</div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="text-green-400 font-bold text-sm">{u.balance?.toFixed(2)} DC</div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <button
                                                onClick={() => {
                                                    const amount = prompt(`Quanto deseja adicionar para este usuário?`);
                                                    if (amount && !isNaN(Number(amount))) {
                                                        handleManualRecharge(u.id, Number(amount));
                                                    }
                                                }}
                                                className="bg-primary/10 hover:bg-primary hover:text-white text-primary px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                Adicionar Saldo
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="text-center py-10 text-gray-500 text-[10px] uppercase">
                                Nenhum usuário encontrado
                                <br />
                                <button onClick={fetchUsers} className="mt-4 text-primary hover:underline">Recarregar Lista</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
