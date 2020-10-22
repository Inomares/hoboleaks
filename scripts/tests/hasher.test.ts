const hasher = require("../hasher.js");

test("serialize simple string", () => {
    expect(hasher.serialize("abcdefgh")).toBe("abcdefgh");
});
test("serialize bad string", () => {
    expect(hasher.serialize("regex:\"T.*1\" without:;a\\öö<\\n")).toBe("regex%3A%22T.*1%22%20without%3A%3Ba%5C%C3%B6%C3%B6%3C%5Cn");
});

test("serialize number", () => {
    expect(hasher.serialize(12345)).toBe("12345");
});

test("serialize array of numbers", () => {
    expect(hasher.serialize([1, 2, 3, 4])).toBe("7_1,2,3,4");
});

test("serialize array of strings", () => {
    expect(hasher.serialize(["one", "two", "three", "a", "five"])).toBe("20_one,two,three,a,five");
});

test("serialize set", () => {
    let s = new Set();
    s.add(0);
    s.add(2);
    s.add(5);
    expect(hasher.serialize(s)).toBe("5_0,2,5"); // Sets retain insertion order for some reason
});

// test("serialize nested array", () => {
//     let a = new Array<Array<Number|String>>();
//     a.push([1,2,3]);
//     a.push([4,1,"a"]);
//     a.push(["hello", "world"]);
//     a.push(["hellö;", "w,orld"]);
//     expect(hasher.serialize(a)).toBe("A60_A5_1,2,3,A5_4,1,a,A11_hello,world,A22_hell%C3%B6%3B,w%2Corld");
// });

test("deserialize simple string", () => {
    expect(hasher.deserialize("abcdefgh", ["String"])).toBe("abcdefgh");
});

test("deserialize simple string", () => {
    expect(hasher.deserialize("regex%3A%22T.*1%22%20without%3A%3Ba%5C%C3%B6%C3%B6%3C%5Cn", ["String"])).toBe("regex:\"T.*1\" without:;a\\öö<\\n");
});

test("deserialize number", () => {
    expect(hasher.deserialize("012345", ["Number"])).toBe(12345);
});

test("deserialize simple array", () => {
    expect(hasher.deserialize("7_1,2,3,4", ["Array", "Number"])).toStrictEqual([1, 2, 3, 4]);
});

test("deserialize set", () => {
    expect(hasher.deserialize("7_1,2,3,4", ["Set", "Number"])).toStrictEqual(new Set([1, 2, 3, 4]));
});