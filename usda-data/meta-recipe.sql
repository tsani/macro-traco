DROP TABLE IF EXISTS `meta_recipe`;
CREATE TABLE `meta_recipe` (
    parent_id INT REFERENCES recipe(id) NOT NULL,
    child_id INT REFERENCES recipe(id) NOT NULL,
    amount INT NOT NULL,
    seq_num INT NOT NULL,
    display_unit TEXT NOT NULL,
    PRIMARY KEY(parent_id, child_id)
);
CREATE INDEX `meta_recipe_parent_idx` ON `meta_recipe`(parent_id);
