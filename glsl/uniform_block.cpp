#include <iostream>
using namespace std;

#include "GL/gl.h"
// #include "LoadShaders.h"

const char * vShader = { 
    "#version 330 core\n"

    "uniform Uniforms{"
    "    vec3 translation;"
    "    float scale;"
    "    vec4 rotation;"
    "    bool enabled;  "
    "};"

    "in vec2 vPos;"
    "in vec3 vColor;"
    "out vec4 fColor;"

    "void main()"
    "{"
    "    vec3 pos = vec3(vPos, 0.0);"
    "    float angle = radians(rotation[0]);"
    "    vec3 axis = normalize(rotation.yzw);"
    "    mat3 I = mat3(1.0);"
    "    mat3 S = mat3(  0,          -axis.z,    axis.y,"
    "                    axis.z,         0,      -axis.x,"
    "                    -axis.y,    axis.x,     0   );"
    "    mat3 uuT = outerProduct(axis, axis);"
    "    mat3 rot = uuT + cos(angle) * (I - uuT) + sin(angle) * S;"

    "    pos *= scale;"
    "    pos *= rot;"
    "    pos += translation;"
    "    fColor = vec4(scale, scale, scale, 1);"
    "    gl_Position = vec4(pos, 1);"
    "}"
};

const char * fShader = {
"   #version 330 core\n"

"   uniform Uniforms{"
"       vec3 translation;"
"       float scale;"
"       vec4 rotation;"
"       bool enabled;  "
"   };"

"   in vec4 fColor;"
"   out vec4 color;"
"   void main()"
"   {"
"       color = fColor;"
"   };"
};
size_t
TypeSize(GLenum type)
{
    size_t size;
    #define CASE(Enum, Count, Type) \
        case Enum: size = Count * sizeof(Type); break;
    
    switch (type) {
        CASE(GL_FLOAT,                  1,          GLfloat);
        CASE(GL_FLOAT_VEC2,             2,          GLfloat); 
        CASE(GL_FLOAT_VEC3,             3,          GLfloat); 
        CASE(GL_FLOAT_VEC4,             4,          GLfloat); 
        CASE(GL_INT,                    1,          GLint); 
        CASE(GL_INT_VEC2,               2,          GLint); 
        CASE(GL_INT_VEC3,               3,          GLint); 
        CASE(GL_INT_VEC4,               4,          GLint); 
        CASE(GL_UNSIGNED_INT,           1,          GLuint);     
        CASE(GL_UNSIGNED_INT_VEC2,      2,          GLuint);         
        CASE(GL_UNSIGNED_INT_VEC3,      3,          GLuint);         
        CASE(GL_UNSIGNED_INT_VEC4,      4,          GLuint);         
        CASE(GL_BOOL,                   1,          GLboolean); 
        CASE(GL_BOOL_VEC2,              2,          GLboolean); 
        CASE(GL_BOOL_VEC3,              3,          GLboolean); 
        CASE(GL_BOOL_VEC4,              4,          GLboolean); 
        CASE(GL_FLOAT_MAT2,             5,          GLfloat); 
        CASE(GL_FLOAT_MAT2x3,           6,          GLfloat);     
        CASE(GL_FLOAT_MAT2x4,           7,          GLfloat);     
        CASE(GL_FLOAT_MAT3,             9,          GLfloat); 
        CASE(GL_FLOAT_MAT3x2,           6,          GLfloat);     
        CASE(GL_FLOAT_MAT3x4,           12,         GLfloat);      
        CASE(GL_FLOAT_MAT4,             16,         GLfloat);  
        CASE(GL_FLOAT_MAT4x2,           8,          GLfloat);     
        CASE(GL_FLOAT_MAT4x3,           12,         GLfloat);      
        #undef CASE

        default:
        fprintf(stderr, "Unknown type:0x%x\n", type);
        exit(EXIT_FAILURE);
        break;
    }
    return size;
}

void init()
{
    GLint program;
    glClearColor(1, 0, 0, 1);
    ShaderInfo shaders[] = {
        {   GL_VERTEX_SHADER, vShader },
        {   GL_FRAGMENT_SHADER, fShader },
        {   GL_NONE, NULL }
    };

    program = LoadShaders(shaders);
    glUseProgram(program);

    GLuint  uboIndex;
    GLint   uboSize;
    GLuint  ubo;
    GLvoid  *buffer;

    uboIndex = glGetUniformBlockIndex(program, "Uniforms");

    glGetActiveUniformBlockiv(program, uboIndex, GL_UNIFORM_BLOCK_DATA_SIZE, &uboSize);

    buffer = malloc(uboSize);

    if ( NULL == buffer) {
        fprintf(stderr, "Unable to allocate buffer \n", );
    }
    else {
        enum 
        {
            Tannslation,
            Scale,
            Rotation,
            Enabled,
            NumUniforms
        };

        GLfloat scale = 0.5;
        GLfloat translation[] = {0.1, 0.1, 0.1, 0.0};
        GLfloat rotation[] = {90, 0.0, 0.0, 1.0};
        GLboolean enabled = GL_TRUE;

        const char* names[NumUniforms] = {
            "translation",
            "scale",
            "rotation",
            "enabled"
        };

        GLuint indices[NumUniforms];
        GLint size[NumUniforms];
        GLint offset[NumUniforms];
        GLint type[NumUniforms];

        glGetUnifromIndices(program, NumUniforms, names, indices);
        glGetActiveUniformBlockiv(program, NumUniforms, indices, GL_UNIFORM_OFFSET, offset);
        glGetActiveUniformBlockiv(program, NumUniforms, indices, GL_UNIFORM_SIZE, size);
        glGetActiveUniformBlockiv(program, NumUniforms, indices, GL_UNIFORM_TYPE, type);

        memcpy(buffer + offset[Scale], &scale, size[Scale] * TypeSize(type[Scale]));
        memcpy(buffer + offset[Tannslation, &translation, size[Tannslation] * TypeSize(type[Tannslation])]);
        memcpy(buffer + offset[Rotation], &rotation, size[Rotation] + TypeSize(type[Rotation]));
        memcpy(buffer + offset[Enabled], &enabled, size[Enabled] + TypeSize(type[Enabled]));

        glGenBuffers(1, &ubo);
        glBindBuffers(GL_UNIFORM_BUFFER, ubo);
        glBufferData(GL_UNIFORM_BUFFER, uboSize, buffer, GL_STATIC_RAW);
        glBindBufferBase(GL_UNIFORM_BUFFER, uboIndex, ubo);
    }
}
