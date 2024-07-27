class FoodNutFact:
    def __init__(self, nut_facts=None):
        self.nut_fact = {} if nut_facts is None else nut_facts

    def to_dict(self):
        return self.nut_fact.copy()

    def __add__(self, other):
        total = self.nut_fact.copy()
        for key in other.nut_fact:
            if key in self.nut_fact:
                assert self[key][1] == other[key][1]
                total[key] = (other[key][0] + self[key][0], other[key][1])
            else:
                total[key] = other[key]
        return FoodNutFact(total)

    def __getitem__(self, key):
        return self.nut_fact[key]

    def __setitem__(self, key, value):
        self.nut_fact[key] = value

    def __str__(self):
        return str(self.nut_fact)

    def __repr__(self):
        return repr(self.nut_fact)

    def __mul__(self, multiplicand):
        new_dic = self.nut_fact.copy()
        for key in self.nut_fact:
            value, unit = self.nut_fact[key]
            new_dic[key] = value * multiplicand, unit
        return FoodNutFact(new_dic)
