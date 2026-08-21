import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Child, ListChildrenResponse } from '@ninibu/types';
import { api, apiPaths } from '@/lib/api';
import { getSelectedChildId, setSelectedChildId } from '@/lib/storage';

type Value={children:Child[];selected?:Child;loading:boolean;error?:string;select:(id:number)=>void;reload:()=>Promise<void>};
const Context=createContext<Value|null>(null);
export function ChildProvider({children:node}:{children:ReactNode}){
 const [items,setItems]=useState<Child[]>([]);const [selectedId,setSelectedId]=useState<number>();const [loading,setLoading]=useState(true);const [error,setError]=useState<string>();
 async function reload(){setLoading(true);setError(undefined);try{const r=await api<ListChildrenResponse>(apiPaths.children);setItems(r.items);const saved=await getSelectedChildId();const id=(saved&&r.items.some(x=>x.id===saved)?saved:r.items[0]?.id);setSelectedId(id);if(id)await setSelectedChildId(id);}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setLoading(false)}}
 useEffect(()=>{reload();},[]); const select=(id:number)=>{setSelectedId(id);void setSelectedChildId(id)}; const selected=items.find(x=>x.id===selectedId)||items[0];
 return <Context.Provider value={useMemo(()=>({children:items,selected,loading,error,select,reload}),[items,selected,loading,error])}>{node}</Context.Provider>;
}
export function useChild(){const v=useContext(Context);if(!v)throw new Error('ChildProvider missing');return v;}
