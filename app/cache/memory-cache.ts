export class MemoryCache {
    private static cache = {} as Record<string, string>
    
    static get(key:string){
        const value = MemoryCache.cache[key];
        
        if (value === undefined){
            return null
        }
        
        return value;
    }
    
    static set(key: string, value: string){
        if (!value || value === ''){
            return
        }
        
        MemoryCache.cache[key] = value;
    }
    
    static del(key: string){
        if (MemoryCache.cache[key] === undefined){
            return
        }
        
        delete MemoryCache.cache[key];
    }
    
    static keys(){
        return Object.keys(MemoryCache.cache);
    }
}