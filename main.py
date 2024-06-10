import numpy as np
import moderngl_window as mglw


class Example(mglw.WindowConfig):
    gl_version = (3, 3)
    title = "ModernGL Example"
    window_size = (1280, 720)
    aspect_ratio = 16 / 9
    resizable = True


class SimpleColorTriangle(Example):
    gl_version = (3, 3)
    aspect_ratio = 16 / 9
    title = "Simple Color Triangle"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        with open("./shaders/vert.glsl", "r") as f:
            vertex_shader = f.read()

        with open("./shaders/frag.glsl", "r") as f:
            fragment_shader = f.read()

        self.prog = self.ctx.program(
            vertex_shader=vertex_shader,
            fragment_shader=fragment_shader,
        )

        # Point coordinates are put followed by the vec3 color values
        vertices = np.array(
            [
                # x, y, red, green, blue
                0.0,
                0.8,
                1.0,
                0.0,
                0.0,
                -0.6,
                -0.8,
                0.0,
                1.0,
                0.0,
                0.6,
                -0.8,
                0.0,
                0.0,
                1.0,
            ],
            dtype="f4",
        )

        self.vbo = self.ctx.buffer(vertices)

        # We control the 'in_vert' and `in_color' variables
        self.vao = self.ctx.vertex_array(
            self.prog,
            [
                # Map in_vert to the first 2 floats
                # Map in_color to the next 3 floats
                self.vbo.bind("in_vert", "in_color", layout="2f 3f"),
            ],
        )

    def render(self, time: float, frame_time: float):
        self.ctx.clear(0.0, 0.0, 0.0)
        self.vao.render()


if __name__ == "__main__":
    SimpleColorTriangle.run()
