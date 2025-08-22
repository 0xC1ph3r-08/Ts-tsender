import { describe , it , expect } from "vitest";
import { calculateTotal } from './calculateTotal';

describe('calculateTotal',()=>{
    it('should work with newlines',()=>{
        expect(calculateTotal("100\n200\n300")).toBe(600);
        expect(calculateTotal("100\n200\n300\n")).toBe(600);
    });

    it('should work with delimiters',()=>{
        expect(calculateTotal("100,200,300")).toBe(600);
        expect(calculateTotal('1.5\n2.5\n3.5')).toBe(7.5);
        expect(calculateTotal('200\n,,300\n400')).toBe(900);
    });
    
    it('should handle empty inputs',()=>{
        expect(calculateTotal("")).toBe(0);
        expect(calculateTotal(",\n,  ")).toBe(0);
    });

    it('should handle invalid numbers',()=>{
        expect(calculateTotal("100three,200")).toBe(300);

    })
});