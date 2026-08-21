import { useCallback, useEffect, useState } from 'react';
export function useAsync<T>(loader: () => Promise<T>, deps: readonly unknown[] = []) {
  const [data,setData]=useState<T>(); const [loading,setLoading]=useState(true); const [error,setError]=useState<Error>(); const [nonce,setNonce]=useState(0);
  const reload=useCallback(()=>setNonce(v=>v+1),[]);
  useEffect(()=>{ let active=true; setLoading(true); setError(undefined); loader().then(v=>active&&setData(v)).catch(e=>active&&setError(e instanceof Error?e:new Error(String(e)))).finally(()=>active&&setLoading(false)); return()=>{active=false}; },[nonce,...deps]);
  return {data,loading,error,reload,setData};
}
