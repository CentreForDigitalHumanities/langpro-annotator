import { ParseResult, ParseTreeType } from "./types";

export const mockResult: ParseResult = {
    parser: "C&C",
    sentences: [
        {
            id: "P1",
            text: "Every man is working",
            parses: [{
                type: ParseTreeType.CCG_DERIVATION,
                root: {
                    type: "binary",
                    rule: "ba",
                    cat: "S<dcl>",
                    left: {
                        type: "binary",
                        rule: "fa",
                        cat: "NP",
                        left: {
                            type: "leaf",
                            lem: "every",
                            tok: "Every",
                            pos: "DT",
                            ner: "0",
                            cat: "NP/N",
                        },
                        right: {
                            type: "leaf",
                            lem: "man",
                            tok: "man",
                            pos: "NN",
                            ner: "0",
                            cat: "N",
                        },
                    },
                    right: {
                        type: "binary",
                        rule: "fa",
                        cat: "VP<dcl>",
                        left: {
                            type: "leaf",
                            lem: "be",
                            tok: "is",
                            pos: "VBZ",
                            ner: "0",
                            cat: "VP<dcl>/VP<ng>"
                        },
                        right: {
                            type: "leaf",
                            lem: "work",
                            tok: "working",
                            pos: "VBG",
                            ner: "0",
                            cat: "VP<ng>"
                        },
                    },
                }
            }, {
                type: ParseTreeType.CCG_TERM,
                root: {
                    type: "binary",
                    cat: "S<dcl>",
                    left: {
                        type: "binary",
                        cat: "vp<dcl>",
                        left: {
                            type: "leaf",
                            lem: "be",
                            tok: "is",
                            pos: "VBZ",
                            ner: "0",
                            cat: "vp<ng>,vp<dcl>",
                        },
                        right: {
                            type: "leaf",
                            lem: "work",
                            tok: "working",
                            pos: "VBG",
                            ner: "0",
                            cat: "vp<ng>",
                        },
                    },
                    right: {
                        type: "binary",
                        cat: "np",
                        left: {
                            type: "leaf",
                            lem: "every",
                            tok: "Every",
                            pos: "DT",
                            ner: "0",
                            cat: "np/n",
                        },
                        right: {
                            type: "leaf",
                            lem: "man",
                            tok: "man",
                            pos: "NN",
                            ner: "0",
                            cat: "n",
                        },
                    },
                }
            }, {
                type: ParseTreeType.CORRECTED_CCG_TERM,
                root: {
                    type: "binary",
                    cat: "S<dcl>",
                    left: {
                        type: "binary",
                        cat: "vp<dcl>",
                        left: {
                            type: "leaf",
                            lem: "be",
                            tok: "is",
                            pos: "VBZ",
                            ner: "0",
                            cat: "vp<ng>,vp<dcl>",
                        },
                        right: {
                            type: "leaf",
                            lem: "work",
                            tok: "working",
                            pos: "VBG",
                            ner: "0",
                            cat: "vp<ng>",
                        },
                    },
                    right: {
                        type: "binary",
                        cat: "np",
                        left: {
                            type: "leaf",
                            lem: "every",
                            tok: "Every",
                            pos: "DT",
                            ner: "0",
                            cat: "np/n",
                        },
                        right: {
                            type: "leaf",
                            lem: "man",
                            tok: "man",
                            pos: "NN",
                            ner: "0",
                            cat: "n",
                        },
                    },
                }
            }, {
                type: ParseTreeType.FIRST_LLF,
                root: {
                    type: "binary",
                    cat: "s<dcl>",
                    left: {
                        type: "binary",
                        cat: "vp<dcl>, s<dcl>",
                        left: {
                            type: "leaf",
                            lem: "every",
                            tok: "every",
                            pos: "DT",
                            ner: "0",
                            cat: "n, vp<dcl>, s<dcl>",
                        },
                        right: {
                            type: "leaf",
                            lem: "man",
                            tok: "man",
                            pos: "NN",
                            ner: "0",
                            cat: "n",
                        },
                    },
                    right: {
                        type: "binary",
                        cat: "vp<dcl>",
                        left: {
                            type: "leaf",
                            lem: "be",
                            tok: "be",
                            pos: "VBZ",
                            ner: "0",
                            cat: "vp<ng>, vp<dcl>"
                        },
                        right: {
                            type: "leaf",
                            lem: "work",
                            tok: "work",
                            pos: "VBG",
                            ner: "0",
                            cat: "vp<ng>"
                        },
                    },
                }
            }]
        },
        {
            id: "P2",
            text: "Everybody who is working has an expensive car",
            parses: [{
                type: ParseTreeType.CCG_DERIVATION,
                root: {
                    type: "binary",
                    rule: "ba",
                    cat: "S<dcl>",
                    left: {
                        type: "unary",
                        rule: "lx",
                        cat: "NP",
                        child: {
                            type: "binary",
                            rule: "ba",
                            cat: "N",
                            left: {
                                type: "leaf",
                                lem: "everybody",
                                tok: "Everybody",
                                pos: "DT",
                                ner: "O",
                                cat: "N",
                            },
                            right: {
                                type: "binary",
                                rule: "fa",
                                cat: "N\\N",
                                left: {
                                    type: "leaf",
                                    lem: "who",
                                    tok: "who",
                                    pos: "WP",
                                    ner: "O",
                                    cat: "(N\\N)/VP<dcl>",
                                },
                                right: {
                                    type: "binary",
                                    rule: "fa",
                                    cat: "VP<dcl>",
                                    left: {
                                        type: "leaf",
                                        lem: "be",
                                        tok: "is",
                                        pos: "VBZ",
                                        ner: "O",
                                        cat: "VP<dcl>/VP<ng>",
                                    },
                                    right: {
                                        type: "leaf",
                                        lem: "work",
                                        tok: "working",
                                        pos: "VBG",
                                        ner: "O",
                                        cat: "VP<ng>",
                                    },
                                },
                            },
                        },
                    },
                    right: {
                        type: "binary",
                        rule: "fa",
                        cat: "VP<dcl>",
                        left: {
                            type: "leaf",
                            lem: "have",
                            tok: "has",
                            pos: "VBZ",
                            ner: "O",
                            cat: "VP<dcl>/NP",
                        },
                        right: {
                            type: "binary",
                            rule: "fa",
                            cat: "NP",
                            left: {
                                type: "leaf",
                                lem: "an",
                                tok: "an",
                                pos: "DT",
                                ner: "O",
                                cat: "NP/N",
                            },
                            right: {
                                type: "binary",
                                rule: "fa",
                                cat: "N",
                                left: {
                                    type: "leaf",
                                    lem: "expensive",
                                    tok: "expensive",
                                    pos: "JJ",
                                    ner: "O",
                                    cat: "N/N",
                                },
                                right: {
                                    type: "leaf",
                                    lem: "car",
                                    tok: "car",
                                    pos: "NN",
                                    ner: "O",
                                    cat: "N",
                                },
                            },
                        },
                    },
                }
            }, {
                type: ParseTreeType.CCG_TERM,
                root: {
                    type: "binary",
                    cat: "np",
                    left: {
                        type: "binary",
                        cat: "vp<dcl>",
                        left: {
                            type: "leaf",
                            lem: "have",
                            tok: "has",
                            pos: "VBZ",
                            ner: "O",
                            cat: "np,vp<dcl>",
                        },
                        right: {
                            type: "binary",
                            cat: "np",
                            left: {
                                type: "leaf",
                                lem: "an",
                                tok: "an",
                                pos: "DT",
                                ner: "O",
                                cat: "n,np",
                            },
                            right: {
                                type: "binary",
                                cat: "n",
                                left: {
                                    type: "leaf",
                                    lem: "expensive",
                                    tok: "expensive",
                                    pos: "JJ",
                                    ner: "O",
                                    cat: "n,n",
                                },
                                right: {
                                    type: "leaf",
                                    lem: "car",
                                    tok: "car",
                                    pos: "NN",
                                    ner: "O",
                                    cat: "n",
                                },
                            },
                        },
                    },
                    right: {
                        type: "binary",
                        cat: "n",
                        left: {
                            type: "binary",
                            cat: "n,n",
                            left: {
                                type: "leaf",
                                lem: "who",
                                tok: "who",
                                pos: "WP",
                                ner: "O",
                                cat: "vp<dcl>,n,n",
                            },
                            right: {
                                type: "binary",
                                cat: "vp<dcl>",
                                left: {
                                    type: "leaf",
                                    lem: "be",
                                    tok: "is",
                                    pos: "VBZ",
                                    ner: "O",
                                    cat: "vp<ng>,vp<dcl>",
                                },
                                right: {
                                    type: "leaf",
                                    lem: "work",
                                    tok: "working",
                                    pos: "VBG",
                                    ner: "O",
                                    cat: "vp<ng>",
                                },
                            },
                        },
                        right: {
                            type: "leaf",
                            lem: "everybody",
                            tok: "Everybody",
                            pos: "DT",
                            ner: "O",
                            cat: "n",
                        },
                    },
                },
            }, {
                type: ParseTreeType.CORRECTED_CCG_TERM,
                root: {
                    type: "binary",
                    cat: "s<dcl>",
                    left: {
                        type: "binary",
                        cat: "vp<dcl>",
                        left: {
                            type: "leaf",
                            lem: "have",
                            tok: "has",
                            pos: "VBZ",
                            ner: "O",
                            cat: "np,vp<dcl>",
                        },
                        right: {
                            type: "binary",
                            cat: "np",
                            left: {
                                type: "leaf",
                                lem: "a",
                                tok: "an",
                                pos: "DT",
                                ner: "O",
                                cat: "n,np",
                            },
                            right: {
                                type: "binary",
                                cat: "n",
                                left: {
                                    type: "leaf",
                                    lem: "expensive",
                                    tok: "expensive",
                                    pos: "JJ",
                                    ner: "O",
                                    cat: "n,n",
                                },
                                right: {
                                    type: "leaf",
                                    lem: "car",
                                    tok: "car",
                                    pos: "NN",
                                    ner: "O",
                                    cat: "n",
                                },
                            },
                        },
                    },
                    right: {
                        type: "binary",
                        cat: "np",
                        left: {
                            type: "leaf",
                            lem: "every",
                            tok: "every",
                            pos: "DT",
                            ner: "Ins",
                            cat: "n,np",
                        },
                        right: {
                            type: "binary",
                            cat: "n",
                            left: {
                                type: "binary",
                                cat: "n,n",
                                left: {
                                    type: "leaf",
                                    lem: "who",
                                    tok: "who",
                                    pos: "WP",
                                    ner: "O",
                                    cat: "vp<dcl>,n,n",
                                },
                                right: {
                                    type: "binary",
                                    cat: "vp<dcl>",
                                    left: {
                                        type: "leaf",
                                        lem: "be",
                                        tok: "is",
                                        pos: "VBZ",
                                        ner: "O",
                                        cat: "vp<ng>,vp<dcl>",
                                    },
                                    right: {
                                        type: "leaf",
                                        lem: "work",
                                        tok: "working",
                                        pos: "VBG",
                                        ner: "O",
                                        cat: "vp<ng>",
                                    },
                                },
                            },
                            right: {
                                type: "leaf",
                                lem: "person",
                                tok: "person",
                                pos: "NN",
                                ner: "Ins",
                                cat: "n",
                            },
                        },
                    },
                }
            },
            {
                type: ParseTreeType.FIRST_LLF,
                root: {
                    type: "binary",
                    cat: "s<dcl>",
                    left: {
                        type: "binary",
                        left: {
                            type: "leaf",
                            lem: "every",
                            tok: "every",
                            pos: "DT",
                            ner: "Ins",
                            cat: "n, vp<dcl>, s<dcl>",
                        },
                        right: {
                            type: "binary",
                            cat: "n",
                            left: {
                                type: "binary",
                                cat: "n, n",
                                left: {
                                    type: "leaf",
                                    lem: "who",
                                    tok: "who",
                                    pos: "WP",
                                    ner: "O",
                                    cat: "vp<dcl>, n, n",
                                },
                                right: {
                                    type: "binary",
                                    cat: "vp<dcl>",
                                    left: {
                                        type: "leaf",
                                        lem: "be",
                                        tok: "be",
                                        pos: "VBZ",
                                        ner: "O",
                                        cat: "vp<ng>, vp<dcl>",
                                    },
                                    right: {
                                        type: "leaf",
                                        lem: "work",
                                        tok: "work",
                                        pos: "VBG",
                                        ner: "O",
                                        cat: "vp<ng>",
                                    },
                                },
                            },
                            right: {
                                type: "leaf",
                                lem: "person",
                                tok: "person",
                                pos: "NN",
                                ner: "Ins",
                                cat: "n",
                            },
                        }
                    },
                    right: {
                        type: "binary",
                        cat: "vp<dcl>",
                        left: {
                            type: "var",
                            name: "λx1.",
                            typeInfo: "np"
                        },
                        right: {
                            type: "binary",
                            cat: "s<dcl>",
                            left: {
                                type: "binary",
                                cat: "vp<dcl>, s<dcl>",
                                left: {
                                    type: "leaf",
                                    lem: "a",
                                    tok: "a",
                                    pos: "DT",
                                    ner: "O",
                                    cat: "n, vp<dcl>, s<dcl>",
                                },
                                right: {
                                    type: "binary",
                                    cat: "n",
                                    left: {
                                        type: "leaf",
                                        lem: "expensive",
                                        tok: "expensive",
                                        pos: "JJ",
                                        ner: "O",
                                        cat: "n, n",
                                    },
                                    right: {
                                        type: "leaf",
                                        lem: "car",
                                        tok: "car",
                                        pos: "NN",
                                        ner: "O",
                                        cat: "n",
                                    },
                                },
                            },
                            right: {
                                type: "binary",
                                cat: "vp<dcl>",
                                left: {
                                    type: "var",
                                    name: "λx2.",
                                    typeInfo: "np"
                                },
                                right: {
                                    type: "binary",
                                    cat: "s<dcl>",
                                    left: {
                                        type: "binary",
                                        cat: "vp<dcl>",
                                        left: {
                                            type: "leaf",
                                            lem: "have",
                                            tok: "have",
                                            pos: "VBZ",
                                            ner: "O",
                                            cat: "np, vp<dcl>",
                                        },
                                        right: {
                                            type: "var",
                                            name: "x1",
                                            typeInfo: "np"
                                        },
                                    },
                                    right: {
                                        type: "var",
                                        name: "x2",
                                        typeInfo: "np"
                                    },
                                },
                            },
                        },
                    },
                }
            }]
        }
    ]
};
