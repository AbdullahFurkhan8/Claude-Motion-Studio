# One-to-one Hinglish for the Hindi voice: zips clean tokens onto Whisper word timings (counts must match).
import json
heard = json.load(open("analysis/hi_chunks.json", encoding="utf-8"))
T = """Space bahut thanda hota hai, phir bhi wahan Google ki chaar nayi AI chips ek baar mein sirf 15 minute chal sakti hain, garmi ki wajah se.
ye kaise possible hai? dharti par ek fan aapke laptop ki chip par hawa phenkta hai aur garmi ko le jaata hai.
Space mein hawa hai hi nahin, to garmi ko le jaane wala koi nahin.
baahar nikalne ka ek hi raasta hai roshni, har garm cheez ek invisible roshni chhodti hai, jise infrared kehte hain
wahi garmi jo aap alaav se bina chhue mehsoos karte hain lekin garmi khone ka ye bahut dheema tareeka hai
to space mein ek AI chip aise laptop jaisi hai jiska fan toota hua ho
garmi badhti rehti hai jab tak use band nahin karna padta isliye satellite ko radiators naam ke bade panels chahiye jo apni garmi ko andhere mein chhod saken
aur ek NVIDIA AI rack itni garmi banata hai ki Space Station ka main cooling system bhi use sambhal nahin paata to data centers ko space mein rakhna hi kyon?
sahi orbit mein ek solar panel dharti se aath guna zyada power bana sakta hai, wahan panel lagbhag hamesha dhoop mein rehta hai.
na raat, na baadal, na beech mein hawa isliye SpaceX aise 10 lakh tak satellite chahta hai lekin radiators bhaari hote hain aur abhi sirf ek kilo launch karne ka kharcha lagbhag 3600 dollar hai
Google ke hisaab se launch ko 10 guna se zyada sasta hona hoga tab hi competition ho paayega shayad 2030 ke beech tak Google ke apne project lead ko nahin lagta ki 5 saal tak ye cost mein dharti ko haraayega
lekin ye abhi se ho raha hai pichhle saal Star Cloud naam ki startup ne Orbit mein NVIDIA chip se chhote AI ko Shakespeare par train kiya
to abhi ke liye ye bahut mehnga hai lekin lambe samay mein ye bina zameen, paani ya dharti ki bijli use kiye anant dhoop par AI chala sakta hai
aur sabse crazy baat ye poora video code se banaya agar aap bhi seekhna chahte hain to comment mein guide likhiye YouTube aur Tik Tok walon mere bio ka link check kar lo"""
tok = T.split()
print(len(tok), len(heard)); assert len(tok) == len(heard)
json.dump([{"w": t, "s": h["s"], "e": h["e"]} for t, h in zip(tok, heard)], open("analysis/hi_clean.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
